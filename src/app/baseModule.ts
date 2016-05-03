﻿import angular = require("angular");
import storageModule = require("storageModule");
"use strict";


/** @Brief viewmodel para la vista 'mainMenuView' que implementa el menu principal de la aplicacion */
export class ViewModelBase
{
    // #region [Variables miembro]

    /** Ambito del controlador */
    private m_scope: ng.IScope;

    // #endregion [Variables miembro]


    /** Constructor por defecto de la clase */
    constructor($scope: ng.IScope)
    {
        // inicializar variables miembro
        this.m_scope = $scope;
    }


    // #region [Propiedades]

    protected get Scope(): ng.IScope
    {
        return this.m_scope;
    }

    /** Propiedad para obtener datos personalizados de intercambio en navegacion de paginas. Si la pagina fuente no ha almacenado nada, no existira ningun valor aqui
     * @remarks La funcion almacena un dato temporal en el localstorage que sera eliminado al obtenerse, de modo que al obtenerse en la pagina destino de la navegacion, sera eliminado del localstorage.
     * en caso de existir viewmodels anidados, solo estara disponible en el viewmodel padre, ya que sera el primero que obtenga los datos antes de eliminarse.
     */
    protected static get NavigationData(): any
    {
        // obtener y eliminar los datos 
        var result = localStorage.getItem("ViewModelBase.RequestData");
        localStorage.removeItem("ViewModelBase.RequestData");
        return result;
    }

    /** Propiedad para establecer datos personalizados de intercambio en navegacion de paginas. La pagina fuente debera establecer datos en esta propiedad si quieren obtenerse en la pagina destino
     * @remarks La funcion almacena un dato temporal en el localstorage que sera eliminado al obtenerse, de modo que al obtenerse en la pagina destino de la navegacion, sera eliminado del localstorage.
     * en caso de existir viewmodels anidados, solo estara disponible en el viewmodel padre, ya que sera el primero que obtenga los datos antes de eliminarse.
     */
    protected static set NavigationData(_data: any)
    {
        localStorage.setItem("ViewModelBase.RequestData", JSON.stringify(_data));
    }

    // #region [Propiedades]
}