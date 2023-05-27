# Set Thumbnail RTDB

썸네일 이미지가 생성되면 RTDB에 썸네일 정보를 갱신한다.

## Functions Code

[functions/index.js](functions/index.js)에 코드가 담겨 있다.

해당 코드는 썸네일 이미지의 파일명이 항상 `THUMB_PREFIX + (이미지의 파일명)`으로 정의된다고 가정하고 있다.
특수 문자 처리 대응에 대한 추가 작업이 필요할 수도 있다.

## Sample Database Structure

```
/file-ground-grounds
    /grounds
        /0
            /photos
                /image0000png
                    groundId: "0"
                    id: "image0000png"
                    src: "ground/0/image0000png"
                    thumbnail : "ground/0/thumb_image0000png"
                ...
```

## Sample Storage Structure

```
/file-ground-images
    /grounds
        /0
            image0000png
            image0524png
            thumb_image0000png
            thumb_image0524png
```