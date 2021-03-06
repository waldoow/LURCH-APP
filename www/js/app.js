angular.module('LURCH', ['ionic','firebase','LURCH.configs'])

.run(function($ionicPlatform,CONFIG) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);


    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    firebase.initializeApp({
      apiKey: CONFIG.FIREBASE_API,
      authDomain: CONFIG.FIREBASE_AUTH_DOMAIN,
      databaseURL: CONFIG.FIREBASE_DB_URL,
      storageBucket: CONFIG.FIREBASE_STORAGE,
      messagingSenderId: CONFIG.FIREBASE_STORAGE
    });


  });
})

.config(['$stateProvider', '$urlRouterProvider','$ionicConfigProvider',function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

    $ionicConfigProvider.navBar.alignTitle('center');

    $stateProvider

    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'appController'
    })

    .state('login', {
      url: '/login',
      templateUrl: "templates/login.html",
      controller: "loginController"
    })

    .state('signup', {
      url: '/signup',
      templateUrl: "templates/signup.html",
      controller: "signupController"
    })

    .state('reset', {
      url: '/reset',
      templateUrl: "templates/resetemail.html",
      controller: "resetController"
    })

    .state('intro', {
      url: '/intro',
      views: {
        'menuContent': {
          templateUrl: "templates/intro.html",
          controller: "introController"
        }
      }
    })

    .state('app.dashboard', {
      url: '/app/dashboard',
      views: {
        'menuContent': {
          templateUrl: "templates/dashboard.html",
          controller: "dashboardController"
        }
      }
    })

    $urlRouterProvider.otherwise('/login');

}])

.controller('loginController',['$scope', '$firebaseArray', 'CONFIG', '$document', '$state', function($scope, $firebaseArray, CONFIG, $document, $state) {



  $scope.doLogin = function(userLogin) {



    console.log(userLogin);

    if($document[0].getElementById("user_name").value != "" && $document[0].getElementById("user_pass").value != ""){


        firebase.auth().signInWithEmailAndPassword(userLogin.username, userLogin.password).then(function() {



                    var user = firebase.auth().currentUser;

                    var name, email, photoUrl, uid;

                    if(user.emailVerified) { //check for verification email confirmed by user from the inbox

                      console.log("email verified");
                      $state.go("app.dashboard");

                      name = user.displayName;
                      email = user.email;
                      photoUrl = user.photoURL;
                      uid = user.uid;

                      firebase.auth().onAuthStateChanged(function(user) {
                            if (user) {
                                user.getToken().then(function(data) {
                                    console.log(data)
                                });
                            }
                        });

                      localStorage.setItem("photo",photoUrl);

                    }else{

                        alert("Email not verified, please check your inbox or spam messages")
                        return false;

                    } // end check verification email


        }, function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log(errorCode);
          if (errorCode === 'auth/invalid-email') {
             alert('Entrez un e-mail valide.');
             return false;
          }else if (errorCode === 'auth/wrong-password') {
             alert('Mauvais mot de passe.');
             return false;
          }else if (errorCode === 'auth/argument-error') {
             alert('Le mot de passe doit être des lettres et chiffres.');
             return false;
          }else if (errorCode === 'auth/user-not-found') {
             alert('Pas de compte trouvé.');
             return false;
          }else if (errorCode === 'auth/too-many-requests') {
             alert('Trop de tentatives, Essayez plus tard.');
             return false;
          }else if (errorCode === 'auth/network-request-failed') {
             alert('Time out, Essayez encore.');
             return false;
          }else {
             alert(errorMessage);
             return false;
          }
        });



    }else{

        alert('Entrez un e-mail et un mot de passe');
        return false;

    }


  };

}])

.controller('appController',['$scope', '$firebaseArray', 'CONFIG', '$document', '$state', function($scope, $firebaseArray, CONFIG, $document, $state) {

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {

      $document[0].getElementById("photo_user").src = localStorage.getItem("photo");


    } else {
      // No user is signed in.
      $state.go("login");
    }
  });


  $scope.doLogout = function(){

      firebase.auth().signOut().then(function() {
        $state.go("login");

      }, function(error) {
        console.log(error);
      });

}


}])

.controller('resetController', ['$scope', '$state', '$document', '$firebaseArray', 'CONFIG', function($scope, $state, $document, $firebaseArray, CONFIG) {

$scope.doResetemail = function(userReset) {




    if($document[0].getElementById("ruser_name").value != ""){


        firebase.auth().sendPasswordResetEmail(userReset.rusername).then(function() {


          $state.go("login");


        }, function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log(errorCode);


          if (errorCode === 'auth/user-not-found') {
             alert('Pas de compte trouvé avec le mail entré.');
             return false;
          }else if (errorCode === 'auth/invalid-email') {
             alert('E-mail incomplet ou invalide.');
             return false;
          }

        });



    }else{

        alert('Please enter registered email to send reset link');
        return false;

    }


  };


}])



.controller('signupController', ['$scope', '$state', '$document', '$firebaseArray', 'CONFIG', function($scope, $state, $document, $firebaseArray, CONFIG) {

$scope.doSignup = function(userSignup) {




    if($document[0].getElementById("cuser_name").value != "" && $document[0].getElementById("cuser_pass").value != ""){


        firebase.auth().createUserWithEmailAndPassword(userSignup.cusername, userSignup.cpassword).then(function() {

          var user = firebase.auth().currentUser;

          user.sendEmailVerification().then(function(result) { console.log(result) },function(error){ console.log(error)});

          user.updateProfile({
            displayName: userSignup.displayname,
            photoURL: userSignup.photoprofile
          }).then(function() {
            $state.go("login");
          }, function(error) {
            console.log(error);
          });




        }, function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log(errorCode);

          if (errorCode === 'auth/weak-password') {
             alert('Mot de passe trop faible.');
             return false;
          }else if (errorCode === 'auth/email-already-in-use') {
             alert('Email déjà utilisé.');
             return false;
          }




        });



    }else{

        alert('Veuillez entrer un e-mail et un mot de passe.');
        return false;

    }

  };

}])


    .controller('dashboardController',['$scope', '$state', '$firebaseAuth', '$firebaseObject',   function($scope, $state, $firebaseAuth, $firebaseObject){
        var database = firebase.database();

        var storage = firebase.storage();
        var storageRef = storage.ref();

        var picsRefs = database.ref("arrondissements");
        var pics = $firebaseObject(picsRefs);

        // to take an action after the data loads, use the $loaded() promise
       pics.$loaded().then(function() {
          console.log("loaded record:", pics.$id, pics.premier);

          $scope.pics = [];

         // To iterate the key/value pairs of the object, use angular.forEach()
         angular.forEach(pics, function(value, key) {
            console.log(key, value);

            var imgRef = storageRef.child(value);

            var url = imgRef.getDownloadURL().then(function(url) {
              console.log(url);

              $scope.pics.push(url);
              $scope.$apply();
            }).catch(function(error) {
              // Handle any errors here
              console.log('Error on getDownloadURL !', error);
            });
         });
       })
       .catch(function(error) {
       console.log('Error on $loaded !', error);
       });
}]);
