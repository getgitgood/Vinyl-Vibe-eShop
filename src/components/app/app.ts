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
import { RouteCallbacks } from '../../types';
import ProductView from '../view/product-page/ProductView';
import ClientAPI from '../utils/Client';
import '../import-files';

export default class App {
  private header: HeaderView;

  private contentContainer: MainView;

  private router: Router;

  private signupForm: RegView;

  private loginForm: LoginView;

  private clientAPI: ClientAPI;

  constructor() {
    const routesClass = new Routes(this.getRoutesCallbacks());
    const routes = routesClass.getRoutes();
    this.router = new Router(routes);
    this.contentContainer = new MainView();
    this.header = new HeaderView(this.router);
    this.signupForm = new RegView(this.router);
    this.loginForm = new LoginView(this.router);

    this.clientAPI = new ClientAPI();
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
    this.header.getUnnItems.forEach((item) => main.append(item));
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
    const catalog = new CatalogView().getElement();
    this.setContent(PAGES.CATALOG, catalog);
  }

  private loadProductPage() {
    // TODO: connect productID from Catalog Page to Product Page 177a75d9-7bcc-4800-8031-91ac81f2bd29
    // 30b29e00-020c-41aa-8da5-250ae76d2f39
    // 5673e423-c01e-4b35-9ef0-86b1043d08b4
    const product = new ProductView(this.clientAPI, '5673e423-c01e-4b35-9ef0-86b1043d08b4').getElement();
    this.setContent(PAGES.PRODUCT, product);
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
      loadProductPage: this.loadProductPage.bind(this),
    };
  }
}
