-- V21: Delete duplicate DIRECT conversations, keeping only the newest one for each pair of users
DELETE FROM conversations
WHERE id IN (
    SELECT conversation_id FROM (
        SELECT c.id AS conversation_id,
               ROW_NUMBER() OVER (
                   PARTITION BY cm1.user_id, cm2.user_id
                   ORDER BY c.created_at DESC, c.id DESC
               ) as rn
        FROM conversations c
        JOIN conversation_members cm1 ON c.id = cm1.conversation_id
        JOIN conversation_members cm2 ON c.id = cm2.conversation_id
        WHERE c.type = 'DIRECT' AND cm1.user_id < cm2.user_id
    ) t
    WHERE rn > 1
);
