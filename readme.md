# BS-chat

 #### Install project:
 * ```git clone https://github.com/bl00dhound/BSchat```
 * ```cd BSchat/front```
 * ```npm install```
 * ```cd ../server```
 * ```npm install```
 
 #### Run:
 * in server folder: ```npm start```
 * in front folder: ```npm start``` or ```gulp```
 
 > _IMPORTANT!:_
 > If you need to open second window for testing chat - run ```npm start``` or ```gulp``` in separate terminal!
 
 #### Switch beetween HTTP and Websockets
 ##### in `front/src/index.pug`:
   Websockets (default):
```javascript
    //script(src='js/httpService.js')
    //script(src='js/chatHTTP.js')
    script(src='js/chatSocket.js')
```

   HTTP:
```javascript
    script(src='js/httpService.js')
    script(src='js/chatHTTP.js')
    //script(src='js/chatSocket.js')
```
 
 
