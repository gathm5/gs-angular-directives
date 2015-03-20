'use strict';

angular.module('gsDirectives', [])
    .directive('webIntent', [
        '$timeout',
        function ($timeout) {
            return {
                template: '<div class="web-intent"><div class="intent intent-animation" data-ng-if="message"><span class="message">{{message}}</span></div></div>',
                restrict: 'E',
                replace: true,
                controller: function postLink($scope) {
                    var timer;
                    $scope.$on('$alert', function (event, message) {
                        var display = 10 * 1000;
                        if (message.showTime) {
                            display = message.showTime;
                        }
                        $scope.message = message.message;
                        $timeout.cancel(timer);
                        timer = $timeout(function () {
                            $scope.message = null;
                        }, display);
                    });
                    $scope.$on('$alertCancel', function () {
                        $scope.message = null;
                        $timeout.cancel(timer);
                    });
                }
            };
        }
    ])
    .directive('stopEvent', function () {
        // Helps stopping click event propagation to the inner child elements.
        // Re-usable directive. Not specific to Menu Panel.
        return {
            restrict: 'A',
            link: function (scope, element) {
                element.addClass('stop-event');
                element.bind('click', function (e) {
                    e.stopPropagation();
                });
                element.bind('touchstart', function (e) {
                    e.stopPropagation();
                });
                scope.$on('$destroy', function () {
                    element.unbind('click');
                    element.unbind('touchstart');
                });
            }
        };
    })
    .factory('slideOutMenuParams', [
        function () {
            var menuScope;
            return {
                isSlideOpen: false,
                register: function (scope) {
                    menuScope = scope;
                },
                unRegister: function () {
                    menuScope = null;
                },
                open: function () {
                    if (menuScope) {
                        menuScope.$emit('Menu Open');
                    }
                },
                close: function () {
                    if (menuScope) {
                        menuScope.$emit('Menu Close');
                    }
                }
            };
        }
    ])
    .directive('slideOutMenu', [
        'slideOutMenuParams',
        '$timeout',
        function (slideOutMenuParams, $timeout) {
            // Directive Usage:
            // <slide-out-menu>
            //      <ANY CONTENT HERE>
            // </slide-out-menu>

            return {
                restrict: 'E',
                template: '<div class="slide-container" data-ng-click="close()"><div class="slide-menu" data-ng-transclude></div></div>',
                transclude: true,
                replace: true,
                link: function (scope, element, attr) {

                    var ANIMATION_TIME = 200, ANIMATION_HELPER_TIME = 25;

                    switch (true) {
                        case !angular.isUndefined(attr.right):
                            element.addClass('right');
                            break;
                        case !angular.isUndefined(attr.top):
                            element.addClass('top');
                            break;
                        case !angular.isUndefined(attr.bottom):
                            element.addClass('bottom');
                            break;
                        default:
                            element.addClass('left');
                    }

                    // If custom width is defined
                    if (!angular.isUndefined(attr.width)) {
                        element[0].children[0].width = attr.width;
                        angular.element(element[0].children[0]).css('width', attr.width);
                    }

                    // If custom height is defined
                    if (!angular.isUndefined(attr.height)) {
                        element[0].children[0].height = attr.height;
                        angular.element(element[0].children[0]).css('height', attr.height);
                    }

                    // Register the scope to the slide menu params
                    slideOutMenuParams.register(scope);

                    scope.close = function () {
                        scope.$emit('Menu Close');
                    };

                    // Handlers
                    scope.$on('Menu Open', function () {
                        slideOutMenuParams.isSlideOpen = true;
                        element.addClass('ready');
                        $timeout(function () {
                            element.addClass('show');
                        }, ANIMATION_HELPER_TIME);
                    });
                    scope.$on('Menu Close', function () {
                        if (slideOutMenuParams.isSlideOpen) {
                            slideOutMenuParams.isSlideOpen = false;
                            element.removeClass('show');
                            $timeout(function () {
                                element.removeClass('ready');
                            }, ANIMATION_TIME);
                        }
                    });

                    // On Element removal
                    scope.$on('$destroy', function () {
                        slideOutMenuParams.isSlideOpen = false;
                        slideOutMenuParams.unRegister();
                    });

                    // Additional handling during state change
                    scope.$on('$stateChangeStart', function () {
                        scope.$emit('Menu Close');
                    });
                }
            };
        }
    ])
    .factory('drawerParams', function () {
        var menuScope;
        return {
            isDrawerOpen: false,
            register: function (scope) {
                menuScope = scope;
            },
            unRegister: function () {
                menuScope = null;
            },
            open: function () {
                if (menuScope) {
                    menuScope.$emit('Drawer Open');
                }
            },
            toggle: function () {
                if (menuScope) {
                    menuScope.$emit('Drawer Toggle');
                }
            },
            close: function () {
                if (menuScope) {
                    menuScope.$emit('Drawer Close');
                }
            }
        };
    })
    .directive('drawer', [
        'drawerParams',
        '$timeout',
        function (drawerParams) {
            return {
                restrict: 'E',
                template: '<div class="drawer-container" ng-transclude></div>',
                replace: true,
                transclude: true,
                link: function (scope, element, attr) {

                    if (element[0].children.length !== 2) {
                        window.alert('Expecting only two div inside the drawer');
                        return;
                    }

                    switch (true) {
                        case !angular.isUndefined(attr.right):
                            element.addClass('right');
                            break;
                        case !angular.isUndefined(attr.top):
                            element.addClass('top');
                            break;
                        case !angular.isUndefined(attr.bottom):
                            element.addClass('bottom');
                            break;
                        default:
                            element.addClass('left');
                    }

                    // If custom width is defined
                    if (!angular.isUndefined(attr.width)) {
                        element[0].children[0].width = attr.width;
                        angular.element(element[0].children[0]).css('width', attr.width);
                    }

                    // If custom height is defined
                    if (!angular.isUndefined(attr.height)) {
                        element[0].children[0].height = attr.height;
                        angular.element(element[0].children[0]).css('height', attr.height);
                    }

                    // Register the scope to the slide menu params
                    drawerParams.register(scope);

                    scope.close = function () {
                        scope.$emit('Drawer Close');
                    };

                    // Handlers
                    scope.$on('Drawer Open', function () {
                        drawerParams.isDrawerOpen = true;
                        element.addClass('active');
                    });
                    scope.$on('Drawer Toggle', function () {
                        drawerParams.isDrawerOpen = !drawerParams.isDrawerOpen;
                        element.toggleClass('active');
                    });
                    scope.$on('Drawer Close', function () {
                        if (drawerParams.isDrawerOpen) {
                            drawerParams.isDrawerOpen = false;
                            element.removeClass('active');
                        }
                    });

                }
            };
        }
    ])
    .directive('fastClick', [
        function () {
            return {
                restrict: 'EA',
                link: function (scope, element) {
                    if (FastClick) {
                        FastClick.attach(element[0]);
                    }
                }
            };
        }
    ])
    .factory('gsDeviceListeners', [
        '$document',
        '$rootScope',
        function ($document, $rootScope) {

            function init() {
                //Device Ready
                $document[0].addEventListener('deviceReady', function (e) {
                    $rootScope.$broadcast('$device.ready', {
                        eventDefault: e
                    });
                    if (window.cordova && cordova.plugins.Keyboard) {
                        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                    }
                });
                //Back button
                $document[0].addEventListener('backbutton', function (e) {
                    $rootScope.$broadcast('$device.backbutton', {
                        eventDefault: e
                    });
                });
                //Menu Button
                $document[0].addEventListener('menubutton', function (e) {
                    $rootScope.$broadcast('$device.menubutton', {
                        eventDefault: e
                    });
                });
                //Blur
                $document[0].addEventListener('blur', function (e) {
                    $rootScope.$broadcast('$device.blur', {
                        eventDefault: e
                    });
                });
                //Focus
                $document[0].addEventListener('focus', function (e) {
                    $rootScope.$broadcast('$device.focus', {
                        eventDefault: e
                    });
                });
                //Pause
                $document[0].addEventListener('pause', function (e) {
                    $rootScope.$broadcast('$device.pause', {
                        eventDefault: e
                    });
                });
                //Resume
                $document[0].addEventListener('resume', function (e) {
                    $rootScope.$broadcast('$device.resume', {
                        eventDefault: e
                    });
                });
                //online
                $document[0].addEventListener('online', function (e) {
                    $rootScope.$broadcast('$device.online', {
                        eventDefault: e
                    });
                });
                //offline
                $document[0].addEventListener('offline', function (e) {
                    $rootScope.$broadcast('$device.offline', {
                        eventDefault: e
                    });
                });
            }

            // Public API here
            return {
                init: init
            };
        }
    ])
    .provider('gsDeviceDetection', [
        function deviceDetectionProvider() {
            var isMobile = false;
            (function (a) {
                if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) ||
                    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
                    isMobile = true;
                }
            }(navigator.userAgent || navigator.vendor || window.opera));

            this.$get = [function () {
                return isMobile;
            }];
        }
    ])
    .directive('gsDatePicker', function () {
        return {
            restrict: 'E',
            template: '<div class="gs-date gs-picker"> <div class="gs-middle-me"> <div class="gs-increase"> <span class="gs-box-block" ng-click="change.monthUp()"> <i class="fa fa-chevron-up"></i> </span> <span class="gs-box-block" ng-click="change.dateUp()"> <i class="fa fa-chevron-up"></i> </span> <span class="gs-box-block" ng-click="change.yearUp()"> <i class="fa fa-chevron-up"></i> </span> </div> <div class="gs-date-block gs-nice-font"> <span class="gs-box-block"> {{gsDate.month}} </span> <span class="gs-box-block"> {{gsDate.date}} </span> <span class="gs-box-block"> {{gsDate.year}} </span> </div> <div class="gs-decrease"> <span class="gs-box-block" ng-click="change.monthDown()"> <i class="fa fa-chevron-down"></i> </span> <span class="gs-box-block" ng-click="change.dateDown()"> <i class="fa fa-chevron-down"></i> </span> <span class="gs-box-block" ng-click="change.yearDown()"> <i class="fa fa-chevron-down"></i> </span> </div> </div> <div class="gs-button" ng-click="change.today()"> set Today </div></div>',
            scope: {
                date: '='
            },
            link: function ($scope, element, attr) {
                var months = [
                    'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
                ];
                var maxDates = [
                    31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31
                ];
                $scope.gsDate = {
                    date: null,
                    month: null,
                    year: null
                };
                $scope.change = {
                    monthUp: function () {
                        var idx = months.indexOf($scope.gsDate.month);
                        idx + 1 > 11 ? idx = 0 : idx += 1;
                        $scope.gsDate.month = months[idx];
                    },
                    monthDown: function () {
                        var idx = months.indexOf($scope.gsDate.month);
                        idx - 1 < 0 ? idx = 11 : idx -= 1;
                        $scope.gsDate.month = months[idx];
                    },
                    dateUp: function () {
                        var maxDate = 31;
                        var idx = months.indexOf($scope.gsDate.month);
                        var isLeap = new Date($scope.gsDate.year, 1, 29).getMonth() === 1;
                        if (idx === 1 && isLeap) {
                            maxDate = 29;
                        } else {
                            maxDate = maxDates[idx];
                        }
                        $scope.gsDate.date + 1 > maxDate ? $scope.gsDate.date = 1 : $scope.gsDate.date += 1;
                    },
                    dateDown: function () {
                        var minDate = 31;
                        var idx = months.indexOf($scope.gsDate.month);
                        var isLeap = new Date($scope.gsDate.year, 1, 29).getMonth() === 1;
                        if (idx === 1 && isLeap) {
                            minDate = 29;
                        } else {
                            minDate = maxDates[idx];
                        }
                        $scope.gsDate.date - 1 < 1 ? $scope.gsDate.date = minDate : $scope.gsDate.date -= 1;
                    },
                    yearUp: function () {
                        $scope.gsDate.year += 1;
                    },
                    yearDown: function () {
                        $scope.gsDate.year -= 1;
                    },
                    today: function () {
                        var now = new Date();
                        $scope.gsDate.month = months[now.getMonth()];
                        $scope.gsDate.date = now.getDate();
                        $scope.gsDate.year = now.getFullYear();
                    }
                };
                if ($scope.date) {
                    if (typeof $scope.date.getMonth === 'function') {
                        $scope.gsDate.month = months[$scope.date.getMonth()];
                        $scope.gsDate.date = $scope.date.getDate();
                        $scope.gsDate.year = $scope.date.getFullYear();
                    }
                }
                else {
                    $scope.change.today();
                }
                // Watch
                $scope.$watch('gsDate', function (newDate, oldDate) {
                    if (newDate && newDate !== oldDate) {
                        $scope.date = new Date(newDate.year, newDate.date, newDate.month);
                    }
                });
            }
        };
    })
    .directive('gsInfiniteScroll', function () {
        return {
            restrict: 'A',
            scope: {
                callback: '='
            },
            link: function (scope, element) {

                function unBindScroll() {
                    element.unbind('scroll');
                }


                function bindScroll() {
                    unBindScroll();
                    element.bind('scroll', function () {
                        if (element[0].scrollTop + element[0].offsetHeight >= element[0].scrollHeight) {
                            scope.callback.call();
                        }
                    });
                }

                scope.$on('$destroy', function () {
                    unBindScroll();
                });

                //Invoke
                bindScroll();
            }
        };
    });