
function debounce(callback, timeout, _this) {
    var timer;
    return function(e) {
        var _that = this;
        if (timer)
            clearTimeout(timer);
        timer = setTimeout(function() { 
            callback.call(_this || _that, e);
        }, timeout);
    }
}

// events
var userAction = debounce(function(e) {
    window.location.href = "synthDemo_Cover.html";
}, 600000);

document.addEventListener("mousemove", userAction, false);
document.addEventListener("click", userAction, false);
document.addEventListener("scroll", userAction, false);
window.addEventListener("load", userAction, false);