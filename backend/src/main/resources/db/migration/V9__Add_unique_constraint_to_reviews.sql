-- Tạo một rào cản: Một người (reviewer_id) chỉ được tạo tối đa 1 review cho một trận đấu (match_request_id)
ALTER TABLE reviews
    ADD CONSTRAINT uk_match_reviewer UNIQUE (match_request_id, reviewer_id);