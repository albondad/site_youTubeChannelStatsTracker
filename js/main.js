//VARIABLES
var channels = [];
var searchFilter = "id"


//CHANNEL CLASS
class Channel {
    constructor(statistics) {
        this.date = new Date();
        this.timeStamps = [this.date.getHours() + ":" + this.date.getMinutes() + ":" + this.date.getSeconds()]

        this.username = statistics.snippet.title;
        this.id = statistics.id;
        this.currentSubscriberCount = parseInt(statistics.statistics.subscriberCount, 10);
        this.subscriberCounts = [this.currentSubscriberCount]
        this.currentViewCount = parseInt(statistics.statistics.viewCount, 10);
        this.description = statistics.snippet.description
        this.descriptionContentType = "statsContent01"
        if (this.description.length>200) {
            this.description = this.description.substring(0,200) + "...";
        }
        if (this.description.length > 50) {
            this.descriptionContentType = "statsContent02";
        }
        this.country = statistics.snippet.country;
    }

    update(newStatistics) {
        //updates subscriber count
        this.date = new Date();
        this.currentSubscriberCount = parseInt(newStatistics.statistics.subscriberCount, 10);
        this.subscriberCounts.push(this.currentSubscriberCount);

        //updates view count
        this.currentViewCount = parseInt(newStatistics.statistics.viewCount, 10);

        //updates time stamp
        this.timeStamps.push(this.date.getHours() + ":" + this.date.getMinutes() + ":" + this.date.getSeconds());

        //displays subscribers statistics
        $("#" + this.username + "_currentSubscriberCount").html(this.currentSubscriberCount.toLocaleString('en'));
        this.subscriberChart.data.labels = this.timeStamps;
        this.subscriberChart.data.datasets[0].data = this.subscriberCounts;
        this.subscriberChart.update();

        //displays views statistics
        $("#" + this.username + "_currentViewCount").html(this.currentViewCount.toLocaleString('en'));

    }

    drawChart() {
        this.subscriberChart = new Chart(this.username + '_subscriberChart', {
            type: 'line',
            data: {
                labels: this.timeStamps,
                datasets: [{
                        data: this.subscriberCounts,
                        label: "Subscribers",
                        borderColor: "#E84747",
                        pointBackgroundColor: "#E84747",
                        pointBorderWidth: 5,
                        lineTension: 0,
                        fill: true
                    },]
                }
        });
    }
}


//FUNCTIONS
function displayStatistics(channel) {
    output = '<div class="mt-5 mb-5 d-flex justify-content-center">' +
        '<div class="container-fluid w-75">' +
            '<!--header-->' +
            '<div class="row bg-red01">' +
                '<div class="col-md-12 col-lg-6 foSize-2em foColor-black01 text-center text-lg-left foWeight-700 pt-2 pb-2">' + channel.username.toUpperCase() + '</div>' +
                '<div class="col-md-12 col-lg-6 foSize-2em foColor-black01 text-center text-lg-right foWeight-100 pt-2 pb-2"><a class="" href="https://www.youtube.com/channel/' + channel.id + '" target="_blank">View Channel</a></div>' +
            '</div>' +
            '<!--statistics-->' +
            '<div class="row bg-blac01 p-5 statsContainer">' +
                '<div class="statsContentContainer col-sm-12 col-md-12 col-lg-4 d-flex justify-content-center align-items-center foColor-red01 pt-5 text-center">' +
                    '<p>' +
                        '<span class="statsLabel">SUBSCRIBERS</span>' +
                        '<br/>' +
                        '<span id="' + channel.username + '_currentSubscriberCount' + '" class="statsContent01">' + channel.currentSubscriberCount.toLocaleString('en') + '</span>' +
                    '</p>' +
                '</div>' +
                '<div class="col-sm-12 col-md-12 col-lg-8 d-flex justify-content-center align-items-start foSize-2em foColor-red01">' +
                    '<canvas id="' + channel.username + '_subscriberChart' + '""></canvas>' +
                '</div>' +
                '<div class="statsContentContainer col-sm-12 col-md-4 col-lg-4 d-flex justify-content-center align-items-start foColor-red01 pt-5 text-center">' +
                    '<p>' +
                        '<span class="statsLabel">DESCRIPTION</span>' +
                        '<br/>' +
                        '<span class="' + channel.descriptionContentType + '">' + channel.description + '</span>' +
                    '</p>' +
                '</div>' +
                '<div class="statsContentContainer col-sm-12 col-md-4 col-lg-4 d-flex justify-content-center align-items-start foColor-red01 pt-5 text-center">' +
                    '<p>' +
                        '<span class="statsLabel">COUNTRY</span>' +
                        '<br/>' +
                        '<span class="statsContent01">' + channel.country + '</span>' +
                    '</p>' +
                '</div>' +
                '<div class="statsContentContainer col-sm-12 col-md-4 col-lg-4 d-flex justify-content-center align-items-start foColor-red01 pt-5 text-center">' +
                    '<p>' +
                        '<span class="statsLabel">TOTAL VIEWS</span>' +
                        '<br/>' +
                        '<span class="statsContent01">' + channel.currentViewCount.toLocaleString('en') + '</span>' +
                    '</p>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>';
    $("#statistics").append(output);
    channel.drawChart();
}


//YOUTUBE API
function loadClient() {
    gapi.client.setApiKey("AIzaSyAajeSgs-opE8rpOxawSFUyh_GHJaPOe7I");

    gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
        .then(function() {
                $("#loading").html("")
                $("#loading").css({"height":"0em", "width":"0em"});
                $("#searchSection").css({"display":"block"});
            },
            function(err) {
                $("#loading").html("There was an error loading please try again.")
            });
}

function addChannelBy(searchFilter, input) {
    //searches for valid id in url
    if (searchFilter == "id" ){
        //trying to isolate id or channel name
        input = input.replace("https://www.youtube.com/channel/", '');
        input = input.replace("www.youtube.com/channel/", '');
        input = input.replace("https://www.youtube.com/user/", '');
        input = input.replace("www.youtube.com/user/", '');
        input = input.slice(0, 24);
        if (input.length < 24) {
            searchFilter = "channelName"
        }
    }

    //searching by channel name
    if (searchFilter == "channelName") {
        //checking for duplicates
        isDuplicate = false
        for (i=0; i<channels.length; i++) {
            if (input.toLowerCase() == channels[i].username.toLowerCase()) {
                isDuplicate = true;
            }
        }
        //adding channel
        if (!isDuplicate) {
            gapi.client.youtube.channels.list({
                "part": "snippet,contentDetails,statistics",
                "forUsername": input
            }).then(function(response) {
                newStatistics = response.result.items[0];
                if (newStatistics != undefined) {
                    channels.push(new Channel(newStatistics));
                    displayStatistics(channels[channels.length-1]);
                    isDuplicate = false;
                    $("#errors").html("");
                    console.log(channels[channels.length - 1]);
                }
                else {
                    $("#errors").html("the channel wasn't found");
                }
            });
        }
    }

    //searching by channel url
    if (searchFilter == "id") {
        //checking for duplicates
        isDuplicate = false
        for (i=0; i<channels.length; i++) {
            if (input.toLowerCase() == channels[i].id.toLowerCase()) {
                isDuplicate = true;
            }
        }
        //adding channel
        if (!isDuplicate) {
            gapi.client.youtube.channels.list({
                "part": "snippet,contentDetails,statistics",
                "id": input
            }).then(function(response) {
                newStatistics = response.result.items[0];
                if (newStatistics != undefined) {
                    channels.push(new Channel(newStatistics));
                    displayStatistics(channels[channels.length-1]);
                    isDuplicate = false;
                    console.log(channels[channels.length - 1]);
                }
                else {
                    console.log("channel is undefined")
                }
            });
        }
    }
}

gapi.load("client", loadClient);

//AFTER DOCUMENT LOADS
$(function() {
    $("#btn_submit").click(function() {
        if (searchFilter=="channelName") {
            addChannelBy("channelName", $("#inp_search").val());
        }
        if (searchFilter=="id") {
            addChannelBy("id", $("#inp_search").val());
        }
    });
    $("#lnk_byChannelURL").click(function() {
        $("#btn_filter").text("Search By URL");
        $("#inp_search").attr("placeholder", "channel URL");
        searchFilter = "id"
    });
    $("#lnk_byChannelName").click(function() {
        $("#btn_filter").text("Search By Name");
        $("#inp_search").attr("placeholder", "channel name");
        searchFilter = "channelName"
    });
    $("#lnk_byChannelID").click(function() {
        $("#btn_filter").text("Search By ID");
        $("#inp_search").attr("placeholder", "channel ID");
        searchFilter = "id"
    });
    //updating charts every 10 seconds
    setInterval(function() {
        for(i=0; i<channels.length; i++) {
            gapi.client.youtube.channels.list({
                "part": "snippet,contentDetails,statistics",
                "id": channels[i].id
            }).then(function(response) {
                newStatistics = response.result.items[0];
                targetID = newStatistics.id;

                //find what to update
                for (i=0; i<channels.length; i++) {
                    if (targetID == channels[i].id) {
                        channels[i].update(newStatistics);
                    }
                }
            });
        }
    }, 10000);
});
