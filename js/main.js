//VARIABLES
var channels = [];
var searchFilter = "channelName"


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
        this.currentSubscriberCount = parseInt(newStatistics.statistics.subscriberCount, 10);
        this.subscriberCounts.push(this.currentSubscriberCount);

        //updates view count
        this.currentViewCount = parseInt(newStatistics.statistics.viewCount, 10);

        //updates time stamp
        this.timeStamps.push(this.date.getHours() + ":" + this.date.getMinutes() + ":" + this.date.getSeconds());

        //displays subscribers statistics
        $("#" + this.username + "_currentSubscriberCount").html(this.currentSubscriberCount.toLocaleString('en'));
        this.subscriberChart.data.labels = this.timeStamps;
        console.log(this.timeStamps);
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
                        borderColor: "#CC6666",
                        pointBackgroundColor: "#CC6666",
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
                '<div class="col-md-12 col-lg-6 foSize-2em foColor-white01 text-center text-lg-left foWeight-700 pt-2 pb-2">' + channel.username.toUpperCase() + '</div>' +
                '<div class="col-md-12 col-lg-6 foSize-2em foColor-white01 text-center text-lg-right foWeight-100 pt-2 pb-2"><a class="" href="https://www.youtube.com/channel/' + channel.id + '" target="_blank">View Channel</a></div>' +
            '</div>' +
            '<!--statistics-->' +
            '<div class="row bg-gray02 pt-2">' +
                '<div class="statsContentContainer col-sm-12 col-md-12 col-lg-4 d-flex justify-content-center align-items-center foColor-white01 pt-5 text-center">' +
                    '<p>' +
                        '<span class="statsLabel">SUBSCRIBERS</span>' +
                        '<br/>' +
                        '<span id="' + channel.username + '_currentSubscriberCount' + '" class="statsContent01">' + channel.currentSubscriberCount.toLocaleString('en') + '</span>' +
                    '</p>' +
                '</div>' +
                '<div class="col-sm-12 col-md-12 col-lg-8 d-flex justify-content-center align-items-start foSize-2em foColor-white01">' +
                    '<canvas id="' + channel.username + '_subscriberChart' + '""></canvas>' +
                '</div>' +
                '<div class="statsContentContainer col-sm-12 col-md-4 col-lg-4 d-flex justify-content-center align-items-start foColor-white01 pt-5 text-center">' +
                    '<p>' +
                        '<span class="statsLabel">DESCRIPTION</span>' +
                        '<br/>' +
                        '<span class="' + channel.descriptionContentType + '">' + channel.description + '</span>' +
                    '</p>' +
                '</div>' +
                '<div class="statsContentContainer col-sm-12 col-md-4 col-lg-4 d-flex justify-content-center align-items-start foColor-white01 pt-5 text-center">' +
                    '<p>' +
                        '<span class="statsLabel">DESCRIPTION</span>' +
                        '<br/>' +
                        '<span class="statsContent01">' + channel.country + '</span>' +
                    '</p>' +
                '</div>' +
                '<div class="statsContentContainer col-sm-12 col-md-4 col-lg-4 d-flex justify-content-center align-items-start foColor-white01 pt-5 text-center">' +
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
                }
                else {
                    $("#errors").html("The channel wasn't found.");
                }
            });
        }
    }
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
    $("#lnk_byChannelName").click(function() {
        $("#inp_search").attr("placeholder", "channel name");
        searchFilter = "channelName"
    });
    $("#lnk_byChannelID").click(function() {
        $("#inp_search").attr("placeholder", "channel id");
        searchFilter = "id"
    });

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
