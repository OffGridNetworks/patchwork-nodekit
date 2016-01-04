/*
 * Copyright (c) 2016 OffGrid Networks
 * Portions Copyright (c) 2015-2016 Secure Scuttlebutt Consortium
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
exports = module.exports = {
    "createFromDataUrl": function(dataUrl){
          var b64 = dataUrl.split(',')[1];
          var buf = new Buffer(b64, "base64");
        return {"toPng": function(){
            return buf;
        }}
    },
    "createFromPath": function(file, cb)
    {
        if (!cb) throw new Error("Sync NativeImage not implemented");
          var reader  = new FileReader();
          reader.onloadend = function () {
           const dataUrl = reader.result;
           const img = document.createElement('img')
           img.onload = function() {
            const imgdim = { width: img.width, height: img.height }
             cb(null, {
                 "toDataUrl": function(){ return dataUrl;},
                 "getSize": function(){return imgdim; },
                 "toImg": function(){return img; }
             });
          };
          img.src = reader.result;  
        };
    reader.readAsDataURL(file);
    }
}