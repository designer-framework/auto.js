launchApp("QQ");
console.show()
threads.start(function(){
    //在子线程中调用observeKey()从而使按键事件处理在子线程执行
    events.observeKey();
    events.on("key_down", function(keyCode, events){
        //音量键关闭脚本
        if(keyCode == keys.volume_down){
            log("您选择退出脚本！")
            sleep(2000);
            exit();
        }
    });
});
//跳到主页
dumpToHomePage();
//跳到点赞页
dumpToPraisePage();
//已完成点赞
log("5.加载图标")
log("[完成十次点赞图标]加载完成")
var sImg = images.read("/sdcard/Pictures/Screenshots/hands_s.png");
//赞未点满
log("[赞未点满图标]加载完成")
var nImg = images.read("/sdcard/Pictures/Screenshots/hands_n.png");
//未点赞
log("[未点赞图标]加载完成")
var wImg = images.read("/sdcard/Pictures/Screenshots/hands_wnew.jpg");
//var wImg = images.read("/sdcard/Pictures/Screenshots/hands_w.png");
var count = 11;
//请求截图
if(!requestScreenCapture()){
    toastLog("请求截图失败,脚本退出");
    exit();
}
moveTop();
//获取当前屏幕截图
//var nowScreenImg = captureScreen();
//计算图nowScreenImg 位于坐标1037， 1245处RGB颜色
//var color = images.pixel(nowScreenImg, 1037, 1245);
//点赞成功后的RGB色
//var clickSuccessColor = colors.toString(color);
//将用户点赞框框划至顶部
//从截图nowScreenImg位于坐标930， 1090处到图右下角找寻第一个 clickSuccessColor 像素颜色点
// var point = findColor(captureScreen(), clickSuccessColor, {
//     region: [1, 1],
//     //越小越符合要求
//     threshold: 0.1
// });
// if (point) {
//     //找到第一个
//     forEachClickScreenByPoint(point);
// }
var tempPoint;
var c = 1;
while(true){
    sleep(1000)
    var point = findImage(captureScreen(), wImg, {
        region : [1, 1],
        //越小越符合要求
        threshold : 0
    });
    if (point != null) {
        forEachClickScreenByPoint(point);
        if (tempPoint == null) {
            tempPoint = point;
        } else {
            if (tempPoint.x == point.x && tempPoint.y == point.y) {
                log("坐标被点击" + c + "次:{" + tempPoint.x + ":" + tempPoint.y + "}")
                c++;
                if (c > 3) {
                    //有些点赞会被回滚，会导致无限循环给这位好友点赞。所以直接将该好友从点赞列表删除
                    delFriend(point)
                    log("***删除朋友成功***")
                }
            } else {
                log("重置坐标")
                tempPoint = null;
                c = 0;
            }
        }
    } else {
        var noMore = className("android.widget.TextView").text("暂无更多赞过你的人").findOne(600);
        if (noMore != null) {
            log("点赞完成!")
            break;
        }
        //无可以点赞的坐标，且未发现显示更多按钮，则将列表往上滑
        var moreFriendBtn = className("android.widget.TextView").text("显示更多").findOne(600);
        if (!moreFriendBtn) {
            log("未发现[显示更多]按钮")
            moveTop(0)
            //有显示更多的按钮则点击显示更多
        } else {
            log("发现[显示更多]按钮")
            moreFriendBtn.parent().click();
            sleep(100)
            moveTop(-1)
        }
    }
}
if (!sImg) {
    log("未释放资源")
} else {
    sImg.recycle();
    nImg.recycle();
    wImg.recycle();
    log("Finally:释放资源。。。")
}
exit();

function delFriend(point) {
    mySwipe(device.width-1, point.y, device.width - 300, point.y)
    printBeginPoint(point)
    click(device.width - 30, point.y)
    printEndPoint(point)
}

function mySwipe(x1,y1,x2,y2) {
    if (!swipe(x1, y1, x2, y2, 150)) {
        log("移动失败")
        exit();
    }
}

//找寻从未点击过的坐标,并点赞，直至找不到未点赞的坐标
function forEachClickScreenByPoint(point){
    forEachClickScreen(point, 0, 0, count);
}


//将用户点赞框框划至顶部
function moveTop(){
    sleep(100)
    var maxLayoutIndex = className("android.widget.LinearLayout").find().filter(function(w){
        return w.clickable();
    }).sort(function(a, b){
        return a.indexInParent() < b.indexInParent();
    });

    var btnReact = className("android.widget.TextView").text("谁赞过我").findOne().bounds();
    mySwipe(1, maxLayoutIndex[0].bounds().top, 1, btnReact.bottom)
    sleep(150)
} 

function forEachClickScreen(point, x, y, count) {
   printBeginPoint(point)
   var a = 0;
    for (; a < count; a++) {
        clickScreen(point)
    }
    closeGarbageWindows();
    printEndPoint(point)
}

function printBeginPoint(point){
}

function printEndPoint(point){
}

function closeGarbageWindows(){
    var garbageWindows2 = id("ivTitleBtnLeft").findOne(500);
    if (garbageWindows2 != null) {
        //sleep(10000)
        //garbageWindows2.click();
        log("找到垃圾窗口2，等待处理")
    }
    var garbageWindows4 = id("h7s").findOne(500);
    if (garbageWindows4 != null) {
        garbageWindows4.click();
        log("关闭[提示点赞数]弹窗")
    }
    if (text("金豆数量不足").findOne(200) != null) {
        toast("关闭[金豆数量不足]弹窗")
        text("取消").findOne(300).click()
    }
    if (text("先了解一下").findOne(200) != null) {
        className("android.widget.ImageView").depth(4).find()[0].click();
        log("[先了解一下]弹窗如果一直未关闭，请修改代码!")
    }
    var garbageWindows = className("android.widget.TextView").text("取消").findOne(500);
    if (garbageWindows != null) {
        garbageWindows.click();
        toast("找到垃圾窗口，执行关闭")
    }
}
 

function clickScreen(point) {
    click(point.x, point.y)
}

//1.跳转到点赞页
function dumpToPraisePage(){
    log("3.开始跳转到点赞页")
    sleep(150)
    id("ba1").findOne(100).click();
    sleep(150)
    id("head_layout").click()
    sleep(150)
    id("l0b").findOne(100).click()
    log("4.已跳转到点赞页")
}

//1.跳转到主页
function dumpToHomePage(){
    log("1.开始重置主页")
    while(id("ba1").findOne(200) == null) {
        back();
    }
    while(id("ba1").findOne(200) != null) {
        if (id("h0e").findOne(200) != null) {
            back();
            break;
        } else {
            break;
        }
    }
    log("2.已重置到主页")
}