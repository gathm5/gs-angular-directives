'use strict';

angular.module('gsDirectives', [])
    .directive('webIntent', [
        '$timeout',
        function ($timeout) {
            return {
                template: '<div class="web-intent"><div class="intent animate-fade-up" data-ng-if="message"><span class="message">{{message}}</span></div></div>',
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
                scope.$on('$destroy', function () {
                    element.unbind('click');
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
    .factory('gsEventManager', [
        function () {
            var scopeManager = {};
            return {
                register: function (id, scope) {
                    scopeManager[id] = scope;
                },
                unRegister: function (id) {
                    delete scopeManager[id];
                },
                scope: function (id) {
                    return scopeManager[id];
                },
                reset: function () {
                    scopeManager = {};
                },
                manager: scopeManager
            };
        }
    ])
    .factory('$eventManagementService', [
        'gsEventManager',
        function (EventManager) {
            function message(id, event, params) {
                EventManager.scope(id).$broadcast(event, params);
            }

            return message;
        }
    ])
    .directive('gsEventDriven', [
        'gsEventManager', function (EventManager) {
            return {
                restrict: 'A',
                required: 'gsEventDriven',
                link: function postLink(scope, element, attrs) {
                    if (attrs.gsEventDriven) {
                        EventManager.register(attrs.gsEventDriven, scope, element);
                    }
                    scope.$on('$destroy', function () {
                        if (attrs.gsEventDriven) {
                            EventManager.unRegister(attrs.gsEventDriven);
                            console.log('Scope destroyed', EventManager);
                        }
                    });
                }
            };
        }
    ])
;