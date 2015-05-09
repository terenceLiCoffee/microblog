var app = angular.module('blogger', ['ui.router', 'ngFileUpload' ]);

    app.config(function($stateProvider, $urlRouterProvider){

        $urlRouterProvider.otherwise('/home');

        $stateProvider
            .state('home', {
                url:'/home',
                templateUrl:'/javascripts/templates/home.html',
                controller:'rootCtrl'
            })
            .state('blogposts', {
                url:'/home/:author',
                templateUrl: '/javascripts/templates/blogposts.html',
                controller: 'blogCtrl'
            })
    });



app.controller('rootCtrl', function($scope,$location){

        $scope.visitBlog = function () {
            //if($scope.author && $scope.author.length < 30) {
                console.log($scope.author);
                $location.path('/home/' + $scope.author);
            //else{
            //    alert("Enter a valid name under 30 characters!");
            //}
        }

});

app.controller('blogCtrl', ['Upload','$scope', '$stateParams' , '$http', function(Upload, $scope, $stateParams, $http){
    $scope.formData = {};
    $scope.currentAuthor = $stateParams.author;
    $http.get('/home/' + $stateParams.author) // Add route
        .success(function(data){
            $scope.posts = data;
            console.log(data);
        })
        .error(function(data){
            console.log('Error: ' + data);
        });

    $scope.createPost = function(){
        if($scope.formData.title) {
            $http.post('/' + $stateParams.author, $scope.formData)
                .success(function (data) {
                    $scope.formData = {};
                    $scope.posts = data;
                    console.log(data);
                })
                .error(function (data) {
                    console.log('Error: ' + data);
                });
        }
        else {
            alert("Enter in a title!");
        }
    };

    $scope.deletePost = function(id){
        $http.delete('/' + $stateParams.author +'/' + id)
            .success(function(data){
                $scope.posts = data;
                console.log(data);
            })
            .error(function(data){
                console.log('Error: ' + data);
            });
    };

    $scope.upload = function (files) {
        console.log("INSIDE UPLOAD");

        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                Upload.upload({
                    url: '/upload',
                    fields: {'username': $stateParams.author},
                    file: file
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                }).success(function (data, status, headers, config) {
                    console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                    console.log(data);
                    $scope.formData.image = data;
                    console.log( $scope.formData);
                });
            }
        }
    };

}]);


app.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if(event.which === 13) {
                scope.$apply(function(){
                    scope.$eval(attrs.ngEnter, {'event': event});
                });
                event.preventDefault();
            }
        });
    };
});


