package com.smeal.util;
import com.smeal.exception.InvalidImageException; import java.io.IOException; import org.springframework.beans.factory.annotation.Value; import org.springframework.stereotype.Component; import org.springframework.web.multipart.MultipartFile;
@Component public class ImageValidator {
 private final long maxSize; public ImageValidator(@Value("${file.upload.max-size}")long maxSize){this.maxSize=maxSize;}
 public void validate(MultipartFile file) throws IOException {if(file==null||file.isEmpty())throw new InvalidImageException("Image is required");if(file.getSize()>maxSize)throw new InvalidImageException("Image exceeds configured size limit");byte[] b=file.getBytes();String type=file.getContentType();boolean jpeg=b.length>=3&&(b[0]&255)==255&&(b[1]&255)==216&&(b[2]&255)==255;boolean png=b.length>=8&&(b[0]&255)==137&&b[1]==80&&b[2]==78&&b[3]==71&&b[4]==13&&b[5]==10&&b[6]==26&&b[7]==10;if(!(jpeg&&"image/jpeg".equalsIgnoreCase(type)||png&&"image/png".equalsIgnoreCase(type)))throw new InvalidImageException("Only valid JPEG and PNG images are accepted");}
}
