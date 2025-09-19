package com.example.crawlingservice.exception;

public class ShowPageException extends RuntimeException{
    public ShowPageException(String message){
        super(message);
    }
    public ShowPageException(String message, Throwable cause){
        super(message,cause);
    }
    public ShowPageException(Throwable cause){
        super(cause);
    }
}
