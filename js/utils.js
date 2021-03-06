(function(M){
        var initRequest = function(option){
        console.log("Proxy starts creating Ajax!!");

        var httpRequest = createInstance();
        var success = option.success;
        var url = option.url;
        var method = option.method;
        var data = option.data;

        var dataArr = [];
        for(var i in data){
            dataArr.push(i + "=" + data[i]);
        }

        if(method == "GET"){
            url += "?" + dataArr.join("&");
        }

        if(httpRequest){
            httpRequest.onreadystatechange = function(){
                if(this.readyState == 4){
                    console.log("Proxy Ajax loaded!!");
                    success && success(httpRequest.responseText);
                }
            };

            httpRequest.open(method, url, false);
            //httpRequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
            //httpRequest.setRequestHeader("X-Requested-From","_TC_QC_jsProxy_");

            httpRequest.send(JSON.stringify(data));
            console.log("Proxy created Ajax done!!method: " + method + "; data: " + JSON.stringify(data) + "----already send");
        }else{
            console.error("Proxy created Ajax Error!!");
        }
    };

    var createInstance = function(){
        var xmlHttp;

        try{
            // Firefox,Opera 8.0+,Safari
            xmlHttp = new XMLHttpRequest();
        }catch(e){
            // Internet Explorer
            try{
                xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
            }catch(e){
                try{
                    xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
                }catch(e){
                    return false;
                }
            }
        }

        return xmlHttp;
    };

    var getTmpl = function(tmplStr, data){
        var result;

        var varHtml = "";
        for(var i in data){
            varHtml += "var " + i + " = data." + i + ";";
        }

        tmplStr = tmplStr.replace(/\s+/g, " ");
        tmplStr = varHtml + "var __result = ''; ?>" + tmplStr + "<?";
        tmplStr += " return __result;";
        tmplStr = tmplStr.replace(/<\?=([^\?]+)\?>/g, "' + $1 + '").replace(/<\?/gi, "';").replace(/\?>/g,"__result += '");

        var str = new Function("data", tmplStr);
        result = str(data);

        return result;
    };

    var renderTmpl = function(id, data){
        var tmplNode = document.getElementById(id);
        var tmplString = tmplNode.innerHTML;
        var result = getTmpl(tmplString, data);

        var div = document.createElement("div");
        div.innerHTML = result;

        var divChildren = div.childNodes;

        while(divChildren.length > 0){
            tmplNode.parentNode.insertBefore(divChildren[0], tmplNode);
        }
    };
        var addEvent = function(proxyNode, selector, eventType, func){//为代理节点添加事件监听
                var proName = "",flag = 0;
                if(typeof(selector) == "string"){

                    flag = 1;
                    switch(true){
                        case /^\./.test(selector) :
                            proName = "className";
                            selector = selector.replace(".", "");
                            selector = new RegExp(" *" + selector + " *");
                            break;
                        case /^\#/.test(selector) :
                            proName = "id";
                            selector = new RegExp(selector.replace("#", ""));
                            break;
                        default: 
                            selector = new RegExp(selector);
                            proName = "tagName";
                    }

                }

                var addEvent = window.addEventListener ? "addEventListener" : "attachEvent";
                var eventType = window.addEventListener ? eventType : "on" + eventType;

                proxyNode[addEvent](eventType,function(e){

                        function check(node){

                            if(flag){
                                var proValue;
                                if(proName == "tagName"){
                                    proValue = node.tagName.toLowerCase();
                                }else{
                                    proValue = node[proName];
                                }

                                if(selector.test(proValue)){

                                    func.call(node, e);
                                    return;
                                };

                            }else{
                                if(selector == node){
                                    func.call(node, e);
                                    return;
                                };
                            }

                            if(node == proxyNode || node.parentNode == proxyNode) return;
                            node.parentNode && check(node.parentNode);
                        }

                        check(e.srcElement);
                });
    };
      //读取元素的css属性值
      var css = function(el, property){
        if(el.style[property]){
            return el.style[property];
        }else{
            var computedStyle = getComputedStyle(el);
            return computedStyle.getPropertyValue(property);
        }
      };

          //执行动画   类似jquery animate
      var animate = function(el, endCss, time, callBack){
         var FPS = 60;
         var everyStep = {}, currStyle = {};

         for(var i in endCss){
           var currValue = parseInt(this.css(el, i));
           currStyle[i] = currValue;

           everyStep[i] = parseInt(parseInt(endCss[i]) - currValue) / time;
         }

         //当前frame
         var frame = 0, timer;

         function step(){
           frame ++;

           //当前时间 ms
           var t = frame / FPS * 1000;

           //对时间做缓动变换

           //标准化当前时间
           var t0 = t / time;

           //变换函数
           var f = function(x, p0, p1, p2, p3){

             //二次贝塞尔曲线
             //return Math.pow((1 - x), 2) * p0 + (2 * x) * (1 - x) * p1 + x * x * p2; 

             //基于三次贝塞尔曲线 
             return p0 * Math.pow((1 - x), 3) + 3 * p1 * x * Math.pow((1 - x), 2) + 3 * p2 * x * x * (1 - x) + p3 * Math.pow(x, 3);
           }

           //对时间进行三次贝塞尔变换 输出时间
           var t1 = f(t0, 0.3, 0.82, 1.0, 1.0) * time;

           for(var i in everyStep){
             if(i == "opacity") el.style[i] = (currStyle[i] + everyStep[i] * t1);
             else el.style[i] = (currStyle[i] + everyStep[i] * t1) + "px";
           }

           if(frame == time / 1000 * FPS){
             clearInterval(timer);
             callBack && callBack();
           }
         }

         timer = setInterval(step, 1000 / FPS);

         return {
            stop: function(){
                clearInterval(timer);
            }
         };

      };

    var eventCache = {};
    var bind = (function(){
        function cache(selector, eventType, func){
            //给event做缓存
            var index = selector + "_" + eventType;
            if(eventCache[index]){
            }else{
                eventCache[index] = [];
            }

            eventCache[index].push(func);
        }


        var method = "";

        if(window.addEventListener){

            return function(el, event, func){
                el.addEventListener(event, func, false);
                el.id && cache(el.id, event, func);
            };
        }else{
            return function(el, event, func){
                el.attachEvent("on" + event, func);
                el.id && cache(el.id, event, func);
            };
        }
        
    })();

    var triggerEvent = function(id, eventType){
        var index = id + "_" + eventType;
        var funcs = eventCache[index];

        if(funcs){
            for(var i = 0; i < funcs.length; i ++){
                funcs[i]();
            }
        }
    };


    var unbind = (function(){
        var method = "";

        if(window.addEventListener){

            return function(el, event, func){
                el.removeEventListener(event, func, false);
            };
        }else{
            return function(el, event, func){
                el.detachEvent("on" + event, func);
            };
        }
        
    })();

   var utils = {
        request: initRequest,
        getTmpl: getTmpl,
        renderTmpl: renderTmpl,
        addEvent: addEvent,
        animate: animate,
        css: css,
        bind: bind
    };

    window.AlloyClipTools = {
        Utils: utils
    };
})();
