package com.smeal.dto; import java.time.Instant; public record ErrorDTO(Instant timestamp,int status,String message,String path){}
