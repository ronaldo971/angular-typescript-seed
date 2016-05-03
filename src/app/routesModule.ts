﻿
import angular = require("angular");
"use strict";


/** @Brief Clase para implementar el sistema de enrutado en vitas/vistas-modelos de la aplicacion, la clase hace uso del modulo con el proveedor de rutas de angular permitiendo cargadr dinamicamente las vistas y vistas-modelos.
 * @remarks La clase usa la convencion sobre configuracion al gestionar vistas y vistas-modelos, se puede especificar el directorio de vistas/vistas-modelos al crear la instancia, 
 * pero los nombres de las vistas creadas deben contener el sufijo 'View' y las vistas-modelos 'ViewModels'.
 * Ademas para seguir la convencion usada en archivos de scripts, los nombres de archivos comenzaran por minuscula, en el caso de las vistas-modelos el archivo comenzara por minuscula pero la
 * clase que declara la vista-modelo comenzara por mayuscula.
 * El alias de los view-models en las vistas, sera el mismo que el nombre del view-model sin el sufijo, de modo que el alias de 'oneViewModel' sera 'one'
 */
export class Routes
{

    // #region [Variables miembro]

    /** Variable con el proveedor de rutas de angular-ui */
    private m_urlRouteProvider: ng.ui.IUrlRouterProvider;
    /** Variable con el proveedor de estados de angular-ui */
    private m_stateProvider: ng.ui.IStateProvider;

    /** Variable con la ruta de las vistas por defecto */
    private m_viewsPath: string;
    /** Variable con la ruta de los viewmodels por defecto */
    private m_viewModelsPath: string;
   
    // #endregion [Variables miembro]


    /** Constructor por defecto de la clase */
    constructor()
    {
    }

    
    // #region [Propiedades]

    /** Propiedad para obtener la ruta de las vistas */
    get ViewsPath(): string
    {
        return this.m_viewsPath;
    }

    /** Propiedad para obtener la ruta de los viewmodels */
    get ViewModelsPath(): string
    {
        return this.m_viewModelsPath;
    }

    // #endregion [Propiedades]


    // #region [Funciones publicas]

    /** Funcion para configurar del sistema de rutas de la aplicacion
     *  (debe ser invocado desde la funcion de configuracion de la aplicacion/angular) 
     * @param $stateProvider proveedor de estados de angular-ui-route
     * @param $urlRouterProvider proveedor de rutas de angular-ui-route
     * @param _viewsPath ruta a usar para buscar las vistas (Relativa al sitio web, por defeto: /app/views/
     * @param _viewModelsPath ruta a usar para buscar los viewmodels, por defeto: /app/viewmodels/   
     */
    public configure($stateProvider: ng.ui.IStateProvider, $urlRouterProvider: ng.ui.IUrlRouterProvider, _viewsPath: string = "/app/views/", _viewModelsPath: string = "/app/viewmodels/")
    {
        this.m_stateProvider = $stateProvider;
        this.m_urlRouteProvider = $urlRouterProvider;
        this.m_viewsPath = _viewsPath;
        this.m_viewModelsPath = _viewModelsPath;

        // inicializar las rutas de la aplicacion
        this._initializeRoutes();
    }

    // #endregion [Funciones publicas]


    // #region [Funciones privadas]

    /** Funcion para crear una definicion de ruta que sera usada por angularjs para resolver las vistas/vistas-modelos de forma dinamica haciendo uso de requirejs
     * @param _path Ruta a la vista/vistas-modelo relativa a la carpeta correspondiente (debe coincidir la ruta de la vista/vistas-modelo siguiendo la convencion)
     * @param _requireAuth flag para indicar si requiere autenticacion la ruta, 
     * este flag sera guardado en la definicion de la ruta y podra ser obtenido posteriormente al cargarse para realizar operaciones relacionadas con la autenticacion.
     * @return Definicion de ruta de estado para usar en el modulo route de angular.
     */
    private _defineRoute(_path: string, _requireAuth: boolean = false): IStateDefinition
    {
        // alias del contexto del viewmodel, debera ser usado en las vistas.
        var viewModelAlias = _path.split("/").pop();
        // la ruta de la vista sera la ruta base mas la ruta pasada como parametro y por convencion se añade el sufijo y extension
        var viewPath = this.ViewsPath + _path + "View.html"
        // la ruta de la vista-modelo sera la ruta base mas la ruta pasada como parametro y por convencion se añade el sufijo y extension
        var viewModelPath = this.ViewModelsPath + _path + "ViewModel.js"
        // el nombre de la clase de la vista-modelo por convencion debe ser el mismo que el ultimo fragmento del path, pero empezando por mayuscula y añadiendo el sufijo
        var viewModelFileName = viewModelAlias + "ViewModel";
        var viewModelClass = viewModelFileName.charAt(0).toUpperCase() + viewModelFileName.slice(1);

        // crear el objeto de retorno con la definicion de la ruta
        var result: IStateDefinition =
            {
                templateUrl: viewPath,
                // HACK: Establecer 'as' tambien en el controlador, en algunas integraciones de framweworks como Ionic no funciona 'controllerAs'
                controller: viewModelClass + " as " + viewModelAlias,
                controllerAs: viewModelAlias,
                requireAuth: (_requireAuth) ? _requireAuth : false,
                // añadir mapa con la funcion de resolucion de dependencias que hara uso de requirejs para la carga dinamica
                resolve: {
                    load: ["$q", "$rootScope",
                        ($q: ng.IQService, $rootScope: ng.IRootScopeService) =>
                        {
                            // obtener el objeto defer para resolver la dependencia asincronamente
                            var defer = $q.defer();
                            // cargar el viewmodel mediante require
                            require([viewModelPath],() =>
                            {
                                // indicar que se ha obtenido el recurso resolviendo la promesa
                                defer.resolve();
                                // invocar todos los watchers
                                //$rootScope.$apply();
                            });

                            // retornar el objeto para la resolucion asincrona
                            return defer.promise;
                        }]
                }
            };

        return result;
    }

    /** Funcion para definir e inicializar todas las rutas y su configuracion especifica en la aplicacion. (Todas las rutas deberan ser establecidas aqui) */
    private _initializeRoutes()
    {
        // configurar ruta por defecto
        this.m_urlRouteProvider.otherwise("/one");

        // ------------------------------------------------------------------------------------------------------------------
        // Configurar estados de angular-ui-router, seran usados para la navegacion, permitiendo composicion de vistas

        this.m_stateProvider.state("main", {
            abstract: true,
            views:
            {
                "": this._defineRoute("main")
            }
        });
        this.m_stateProvider.state("main.details", {
            url: "/main",
            views:
            {
                "one": this._defineRoute("one"),
                "two": this._defineRoute("two")
            }
        });


        this.m_stateProvider.state("one", {
            url: "/one",
            views:
            {
                "": this._defineRoute("one")
            }
        });

        this.m_stateProvider.state("two", {
            url: "/two",
            views:
            {
                "": this._defineRoute("two")
            }
        });

        this.m_stateProvider.state("auths", {
            url: "/auths/authQr",
            views:
            {
                "": this._defineRoute("auths/authQr")
            }
        });

    }

    // #endregion [Funciones privadas]


}
