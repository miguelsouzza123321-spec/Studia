CREATE TABLE IF NOT EXISTS public.teacher_subjects (
  id BIGSERIAL PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  subject TEXT NOT NULL
);

DELETE FROM public.teacher_subjects older
USING public.teacher_subjects newer
WHERE older.teacher_id = newer.teacher_id
  AND lower(trim(older.subject)) = lower(trim(newer.subject))
  AND older.ctid < newer.ctid;

CREATE UNIQUE INDEX IF NOT EXISTS idx_teacher_subjects_teacher_subject
  ON public.teacher_subjects (teacher_id, subject);

INSERT INTO public.teacher_subjects (teacher_id, subject)
SELECT u.uid, trim(subject_entry)
FROM public.users u
CROSS JOIN LATERAL regexp_split_to_table(COALESCE(u.subject, ''), '[,;\n]+') AS split(subject_entry)
WHERE trim(subject_entry) <> ''
  AND NOT EXISTS (
    SELECT 1
    FROM public.teacher_subjects ts
    WHERE ts.teacher_id = u.uid
      AND lower(trim(ts.subject)) = lower(trim(subject_entry))
  );
