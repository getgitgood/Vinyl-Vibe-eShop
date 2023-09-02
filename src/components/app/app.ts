/* eslint-disable @typescript-eslint/return-await */
import PAGES from '../router/utils/pages';
import Router from '../router/Router';
import CartView from '../view/cart/CartView';
import HeaderView from '../view/header/HeaderView';
import LoginView from '../view/login/LoginView';
import MainView from '../view/main/MainView';
import NotFoundView from '../view/not-found-page/NotFoundView';
import CatalogView from '../view/pages/catalog/CatalogView';
import ContactsView from '../view/pages/contacts/ContactsView';
import ShippingView from '../view/pages/shipping/ShippingView';
import ProfileView from '../view/profile/ProfileView';
import RegView from '../view/registration/reg-view';
import AboutView from '../view/pages/about/AboutView';
import Routes from '../router/utils/Routes';
import { Route, RouteCallbacks } from '../../types';
import ClientAPI from '../utils/Client';
import State from '../state/State';

export default class App {
  private header: HeaderView;

  private contentContainer: MainView;

  private router: Router;

  private signupForm: RegView;

  private loginForm: LoginView;

  private clientApi: ClientAPI;

  private routesClass: Routes;

  private catalogView: CatalogView;

  private routes: Route[];

  private state: State;

  constructor() {
    this.clientApi = new ClientAPI();
    this.state = new State();
    this.routesClass = new Routes(this.getRoutesCallbacks(), this.clientApi, this.state);
    this.routes = this.routesClass.getRoutes();
    this.router = new Router(this.routes, this.state);
    this.catalogView = new CatalogView(this.clientApi, this.router);
    this.contentContainer = new MainView();
    this.header = new HeaderView(this.router);
    this.signupForm = new RegView(this.router);
    this.loginForm = new LoginView(this.router);
    this.updateRoutes();
  }

  public start(): void {
    this.header.render();
    this.contentContainer.render();
  }

  private setContent(page: string, view: HTMLElement) {
    this.header.updateIcons();
    this.header.updateLinksStatus(page);
    this.contentContainer.setContent(view);
  }

  private loadMainPage() {
    const main = new AboutView().getElement();
    this.setContent(PAGES.MAIN, main);
  }

  private loadLoginPage() {
    this.setContent(PAGES.LOG_IN, this.loginForm.getElement());
  }

  private loadCartPage() {
    const cart = new CartView().getElement();
    this.setContent(PAGES.CART, cart);
  }

  private loadContactsPage() {
    const contacts = new ContactsView().getElement();
    this.setContent(PAGES.CONTACTS, contacts);
  }

  private loadSignupPage() {
    this.setContent(PAGES.SIGN_UP, this.signupForm.getElement());
  }

  private loadProfilePage() {
    this.setContent(PAGES.PROFILE, new ProfileView().getElement());
  }

  private loadShippingPage() {
    const shipping = new ShippingView().getElement();
    this.setContent(PAGES.SHIPPING, shipping);
  }

  private loadNotFoundPage() {
    const notFound = new NotFoundView().getElement();
    this.setContent(PAGES.SHIPPING, notFound);
  }

  private loadCatalogPage() {
    // console.log(this.catalogView.getElement());
    this.setContent(PAGES.CATALOG, this.catalogView.getElement());
  }

  private logoutUser() {
    this.router.stateDeleteToken();
    this.router.navigate(PAGES.MAIN);
    this.resetForms();
  }

  private resetForms(): void {
    this.signupForm = new RegView(this.router);
    this.loginForm = new LoginView(this.router);
  }

  private async mountCategory(key: string) {
    const view = await this.catalogView.mountCategory(key);
    if (view instanceof HTMLElement) {
      this.setContent(PAGES.CATALOG, view);
    }
  }

  private getRoutesCallbacks(): RouteCallbacks {
    return {
      loadContactsPage: this.loadContactsPage.bind(this),
      loadShippingPage: this.loadShippingPage.bind(this),
      loadNotFoundPage: this.loadNotFoundPage.bind(this),
      loadCatalogPage: this.loadCatalogPage.bind(this),
      loadProfilePage: this.loadProfilePage.bind(this),
      loadSignupPage: this.loadSignupPage.bind(this),
      loadLoginPage: this.loadLoginPage.bind(this),
      loadMainPage: this.loadMainPage.bind(this),
      loadCartPage: this.loadCartPage.bind(this),
      logoutUser: this.logoutUser.bind(this),

      mountCategory: this.mountCategory.bind(this),
    };
  }

  public async updateRoutes() {
    try {
      const routes = await this.routesClass.fetchAvailiableCategories();
      if (routes) {
        this.router.updateRoutes(routes);
      }
    } catch (e) {
      console.log('ehrer');
    }
  }
}
