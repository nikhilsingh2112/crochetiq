
CREATE POLICY "Users read own crochet photos" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'crochet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own crochet photos" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'crochet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own crochet photos" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'crochet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own crochet photos" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'crochet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
