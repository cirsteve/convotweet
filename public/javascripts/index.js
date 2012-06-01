$(function () {
    var socket = io.connect("localhost/");
    var tweetList = new Tweets();
    var tweeterList = new Tweeters();


    var App = new AppView;    
/*
    socket.on('new-tweets', function(tweets) {
        console.log(tweets);
        var twts = tweets.results;
        var len = twts.length, i;
        for (i = 0; i<len; i++) {
            var t = new Tweet({user:twts[i].from_user, id: twts[i].from_user_id, entities:twts[i].entities, geo:twts[i].geo,text:twts[i].text, to:twts[i].to_user, created:twts[i].created_at});
            tweetList.add(t);
            var u = new Tweeter({username:twts[i].from_user, id: twts[i].from_user_id, profile_image: twts[i].profile_image_url});
            tweeterList.noDupeAdd(u);
            $('#convo-box').prepend('<p>'+t.get("text")+' - '+t.get("user")+' at '+t.get("created")+'</p>');
        }
        console.log(tweeterList);
    });

    socket.emit('hello-server', {});
    var App = new AppView(socket);
    console.log(App.socket.emit);
    socket.emit('getSearch', {term:"neiltyson"});
*/
});
