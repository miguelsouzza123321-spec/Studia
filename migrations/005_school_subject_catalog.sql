CREATE TABLE IF NOT EXISTS public.school_subjects (
  id BIGSERIAL PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  subject TEXT NOT NULL
);

INSERT INTO public.school_subjects (school_id, subject)
SELECT DISTINCT ON (c.school_id, lower(trim(c.subject)))
  c.school_id,
  trim(c.subject)
FROM (
  SELECT u.school_id, split.subject
  FROM public.users u
  CROSS JOIN LATERAL regexp_split_to_table(COALESCE(u.subject, ''), '[,;\n]+') AS split(subject)
  WHERE u.school_id IS NOT NULL
  UNION ALL
  SELECT u.school_id, ts.subject
  FROM public.teacher_subjects ts
  JOIN public.users u ON u.uid = ts.teacher_id
  WHERE u.school_id IS NOT NULL
) c
WHERE trim(c.subject) <> ''
ORDER BY c.school_id, lower(trim(c.subject)), trim(c.subject)
ON CONFLICT DO NOTHING;

INSERT INTO public.school_subjects (school_id, subject)
SELECT school.id, base.subject
FROM public.schools school
CROSS JOIN (
  VALUES
    ('Língua Portuguesa'),
    ('Matemática'),
    ('História'),
    ('Geografia'),
    ('Ciências'),
    ('Arte'),
    ('Educação Física'),
    ('Língua Inglesa'),
    ('Ensino Religioso'),
    ('Biologia'),
    ('Física'),
    ('Química'),
    ('Filosofia'),
    ('Sociologia'),
    ('Literatura'),
    ('Redação'),
    ('Língua Espanhola'),
    ('Projeto de Vida'),
    ('Tecnologia e Inovação'),
    ('Pensamento Computacional'),
    ('Educação Financeira'),
    ('Eletiva')
) AS base(subject)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.school_subjects existing
  WHERE existing.school_id = school.id
    AND lower(trim(existing.subject)) = lower(trim(base.subject))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_school_subjects_school_subject
  ON public.school_subjects (school_id, subject);

ALTER TABLE public.teacher_subjects
  ADD COLUMN IF NOT EXISTS subject_id BIGINT REFERENCES public.school_subjects(id) ON DELETE CASCADE;

UPDATE public.teacher_subjects ts
SET subject_id = catalog.id
FROM public.users u, public.school_subjects catalog
WHERE u.uid = ts.teacher_id
  AND catalog.school_id = u.school_id
  AND lower(trim(catalog.subject)) = lower(trim(ts.subject))
  AND ts.subject_id IS NULL;

DELETE FROM public.teacher_subjects
WHERE subject_id IS NULL;

DROP INDEX IF EXISTS public.idx_teacher_subjects_teacher_subject;
ALTER TABLE public.teacher_subjects
  DROP COLUMN IF EXISTS subject;
ALTER TABLE public.teacher_subjects
  ALTER COLUMN subject_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_teacher_subjects_teacher_subject
  ON public.teacher_subjects (teacher_id, subject_id);

INSERT INTO public.teacher_subjects (teacher_id, subject_id)
SELECT u.uid, catalog.id
FROM public.users u
CROSS JOIN LATERAL regexp_split_to_table(COALESCE(u.subject, ''), '[,;\n]+') AS split(subject)
JOIN public.school_subjects catalog
  ON catalog.school_id = u.school_id
 AND lower(trim(catalog.subject)) = lower(trim(split.subject))
WHERE u.role = 'teacher'
  AND u.school_id IS NOT NULL
  AND trim(split.subject) <> ''
  AND NOT EXISTS (
    SELECT 1
    FROM public.teacher_subjects existing
    WHERE existing.teacher_id = u.uid
      AND existing.subject_id = catalog.id
  );

ALTER TABLE public.school_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_subjects ENABLE ROW LEVEL SECURITY;
