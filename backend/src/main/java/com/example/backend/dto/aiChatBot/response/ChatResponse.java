package com.example.backend.dto.aiChatBot.response;
public class ChatResponse {
    private String reply;
    private String sessionId;
    public ChatResponse(String reply, String sessionId) {
        this.reply = reply;
        this.sessionId = sessionId;
    }
    public ChatResponse(){}
    public String getReply() {
        return reply;
    }
    public void setReply(String reply){
        this.reply = reply;
    }
    public String getSessionId() {
        return sessionId;
    }
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

}