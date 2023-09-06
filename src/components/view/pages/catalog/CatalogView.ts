import { Attribute, LocalizedString, Price, ProductProjection } from '@commercetools/platform-sdk';
import { ImageArr, PrefetchedData } from '../../../../types';
import Router from '../../../router/Router';
import ClientAPI from '../../../utils/Client';
import ElementCreator from '../../../utils/ElementCreator';
import View from '../../View';
import catalogParams from './catalog-params';
import { filterParams } from './filter/filter-params';
import FilterView from './filter/FilterView';
import '../../../../assets/img/settings.svg';
import SearchView from './search/SearchView';
import PAGES from '../../../router/utils/pages';

export default class CatalogView extends View {
  private clientApi: ClientAPI;

  private filterView: FilterView;

  private router: Router;

  private wrapper: ElementCreator | null;

  private categoriesBtn: Array<HTMLElement>;

  private prefetchedData: PrefetchedData;

  private searchView: SearchView;

  private bcWrapper: HTMLElement;

  constructor(clientApi: ClientAPI, router: Router) {
    super(catalogParams.section);
    this.clientApi = clientApi;
    this.prefetchedData = this.clientApi.getPrefetchedData;
    this.filterView = new FilterView(this.clientApi);
    this.searchView = new SearchView(this.clientApi);
    this.searchFunctionality();
    this.router = router;
    this.bcWrapper = this.breadCrumbWrapper;
    this.wrapper = null;
    this.categoriesBtn = [];
  }

  public async render() {
    await this.configure();
  }

  protected async configure(productInfo?: ProductProjection[], cardsView?: ElementCreator) {
    await this.init(productInfo, cardsView);
    await this.categoriesCbHandler();
  }

  private async init(productInfo?: ProductProjection[], cardsView?: ElementCreator): Promise<void> {
    const wrapper = new ElementCreator(catalogParams.wrapper);
    const mobileMenuBtn = this.createMobileMenuBtn();
    wrapper.addInnerElement(mobileMenuBtn);
    const sideBar = this.assamleSideBar();
    mobileMenuBtn.getElement().addEventListener('click', () => {
      sideBar.getElement().classList.toggle('no-show__aside');
      mobileMenuBtn.getElement().classList.toggle('mobile-btn__active');
    });
    const assambledCards = cardsView || (await this.assamleCards(productInfo));
    wrapper.addInnerElement([sideBar, assambledCards, this.bcWrapper]);

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        sideBar.getElement().classList.remove('no-show__aside');
      }
    });
    const assambledCards = await this.assamleCards(productInfo);
    wrapper.addInnerElement([sideBar, assambledCards]);
    this.wrapper = wrapper;
    wrapper.addInnerElement(this.searchView);
    if (cardsView) {
      return this.addInnerElement(this.wrapper);
    }
    this.addInnerElement(this.wrapper);
  }

  public assamleSideBar() {
    const asideWrapper = new ElementCreator(catalogParams.aside);
    const categories = this.assembleCategories();
    const buttons = this.assambleBtnWrapper();
    asideWrapper.addInnerElement([categories, this.filterView.render(), buttons]);
    return asideWrapper;
  }

  public async fetchAllCardsData() {
    const data = await this.clientApi.getAllCardsData();
    if (data) {
      return data.map((item) => item);
    }
  }

  public async assamleCards(fetchedData?: ProductProjection[]) {
    const cardsData = fetchedData || (await this.fetchAllCardsData());
    const cardsWrapper = new ElementCreator(catalogParams.productCards);
    if (cardsData && <ProductProjection[]>cardsData) {
      cardsData.forEach((data) => {
        const productCard = new ElementCreator(catalogParams.card.wrapper);
        productCard.setAttribute('data-id', data.id);
        if (data.masterVariant.attributes && data.masterVariant.images) {
          const songTitle = this.assambleSongTitle(data.name);
          const attributesArray = data.masterVariant.attributes.map((item) => item);
          const singer = this.assambleSingerTitle(attributesArray);
          const image = this.assambleImage(data.masterVariant.images, data.name);
          const priceElement = this.assamblePrice(data.masterVariant.prices);
          const cartBtn = this.assambleCartBtn();
          productCard.addInnerElement([image, singer, songTitle, priceElement, cartBtn]);
          cardsWrapper.addInnerElement(productCard);
        }
        productCard.setMouseEvent((evt) => this.cardsClickHandler(evt));
      });
    }
    return cardsWrapper;
  }

  private cardsClickHandler(evt: Event) {
    if (evt.target instanceof HTMLElement) {
      let { target } = evt;

      while (!target.dataset.id) {
        target = target.parentElement as HTMLElement;
      }
      const { id } = target.dataset;
      if (id) {
        this.updateCrumbNavigation();
        const productLink = this.prefetchedData.productsUrl.ids.get(id);
        const path = `${PAGES.PRODUCT}/${productLink || ''}`;
        this.router.navigate(path, id);
        this.createBreadCrumbs();
        return;
      }
      console.error("Don't know how you're able to do it, but there is no such Id! ");
      this.router.navigate(PAGES.PRODUCT, id);
    }
  }

  private assambleImage(data: ImageArr[], name: LocalizedString): HTMLElement {
    const image = new ElementCreator(catalogParams.card.img);
    if (data) {
      if (data[0].url !== undefined) {
        image.setImageLink(data[0].url, name['en-US']);
      } else {
        console.log('not Found!');
      }
    }
    return image.getElement();
  }

  private assambleSingerTitle(data: Attribute[]): HTMLElement {
    const singer = new ElementCreator(catalogParams.card.singer);
    singer.setTextContent(data[0].value);
    return singer.getElement();
  }

  private assembleCategories(): HTMLElement {
    const data = this.clientApi.getPrefetchedData.genres;
    const categoriesWrapper = new ElementCreator(catalogParams.categories.wrapper);
    const categoriesHeading = new ElementCreator(catalogParams.asideHeading);
    categoriesWrapper.addInnerElement(categoriesHeading);
    const categoryBox = new ElementCreator(catalogParams.categories.categoryBox);
    const list = new ElementCreator(catalogParams.categoriesList);
    const listItems = data.map((item) => {
      const listItem = new ElementCreator(catalogParams.categoryListItem);
      const categoryLink = new ElementCreator(catalogParams.categories.categoryLink);
      categoryLink.setTextContent(item.name);
      categoryLink.setAttribute('href', `/catalog/category/${item.key}`);
      categoryLink.setAttribute('data-genre', item.key);
      listItem.addInnerElement(categoryLink);
      this.categoriesBtn.push(categoryLink.getElement());
      return listItem;
    });
    list.addInnerElement(listItems);
    categoryBox.addInnerElement(list);
    categoriesWrapper.addInnerElement(categoryBox);
    return categoriesWrapper.getElement();
  }

  private async categoriesCbHandler() {
    if (this.categoriesBtn) {
      this.categoriesBtn.forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          if (e.target instanceof HTMLAnchorElement) {
            this.router.navigate(e.target.href);
          }
        });
      });
    }
  }

  public async mountCategory(key: string) {
    const categoryKey = this.prefetchedData.genres.find((item) => item.key === key);
    const id = categoryKey?.id;
    this.updateCrumbNavigation();
    if (id) {
      const data = await this.clientApi.getSpecificGenreById(id);
      if (data && data.results.length > 0) {
        const dataResults = data.results;
        await this.assamleCards(dataResults).then((cardsView) => {
          if (this.wrapper) {
            this.replaceCards(this.wrapper, cardsView);
          } else {
            this.configure(dataResults);
          }
        });
      }
    }
  }

  public replaceCardsAndReturnElement(wrapper: ElementCreator, cardsView: ElementCreator) {
    const replacedNode = wrapper.getElement().childNodes[2];
    this.updateCrumbNavigation();
    wrapper.getElement().replaceChild(cardsView.getElement(), replacedNode);
    return this;
  }

  public replaceCards(wrapper: ElementCreator, cardsView: ElementCreator) {
    const replacedNode = wrapper.getElement().childNodes[2];
    wrapper.getElement().replaceChild(cardsView.getElement(), replacedNode);
  }

  private assambleSongTitle(title: LocalizedString): HTMLElement {
    const songTitle = new ElementCreator(catalogParams.card.title);
    songTitle.setTextContent(title['en-US']);
    return songTitle.getElement();
  }

  private assambleCartBtn(): HTMLElement {
    const addCartBtn = new ElementCreator(catalogParams.card.addToCartBtn);
    return addCartBtn.getElement();
  }

  private assamblePrice(priceArray: Price[] | undefined): HTMLElement {
    const priceWrapper = new ElementCreator(catalogParams.card.priceWrapper);
    if (priceArray) {
      const priceObj = priceArray[0];
      const currency = priceObj.value.currencyCode === 'USD' ? '$' : '€';
      const price = new ElementCreator(catalogParams.card.price);
      const priceStr = `${priceObj.value.centAmount / 100}${currency}`;
      price.setTextContent(priceStr);
      if (priceObj.discounted) {
        const discountedPrice = new ElementCreator(catalogParams.card.price);
        const discountPriceStr = `${priceObj.discounted.value.centAmount / 100}${currency}`;
        discountedPrice.setTextContent(discountPriceStr);
        price.getElement().classList.add('striked');
        priceWrapper.addInnerElement([price, discountedPrice]);
        return priceWrapper.getElement();
      }
      priceWrapper.addInnerElement(price);
    }
    return priceWrapper.getElement();
  }

  private createMobileMenuBtn() {
    const btn = new ElementCreator(catalogParams.mobileBtn);
    const btnImg = new ElementCreator(catalogParams.mobileBtnImg);
    btn.addInnerElement(btnImg);
    return btn;
  }

  private assambleBtnWrapper() {
    const wrapper = new ElementCreator(filterParams.submitResetBtnWrapper);
    const submitBtn = this.createSubmitBtn();
    const resetBtn = this.createResetBtn();

    wrapper.addInnerElement([resetBtn, submitBtn]);
    return wrapper;
  }

  private createSubmitBtn() {
    const submitBtn = new ElementCreator(filterParams.submitBtn).getElement();
    this.submitBtnHandler(submitBtn);
    return submitBtn;
  }

  private createResetBtn() {
    const resetBtn = new ElementCreator(filterParams.resetBtn).getElement();
    this.resetBtnHandler(resetBtn);
    return resetBtn;
  }

  public resetBtnHandler(element: HTMLElement) {
    element.addEventListener('click', () => {
      this.filterView.resetInputs();
      this.filterView.resetEndpoints();
    });
  }

  public submitBtnHandler(element: HTMLElement) {
    element.addEventListener('click', async () => {
      this.router.navigate(PAGES.FILTER);
      const cardsData = await this.filterView.getFilterData();
      if (cardsData && cardsData.length > 0) {
        this.filterView.resetEndpoints();
        await this.assamleCards(cardsData).then((cardsView) => {
          if (this.wrapper) {
            this.replaceCards(this.wrapper, cardsView);
          }
        });
      }
      if (cardsData && cardsData.length === 0) {
        this.showNoResults('', true);
        this.filterView.resetEndpoints();
      }
    });
  }

  private searchFunctionality() {
    this.searchView.render();
    const [box] = this.searchView.getChildren();
    const [input, btn] = box.childNodes;
    input.addEventListener('keypress', (e) => {
      const { key } = e as KeyboardEvent;
      if (key === 'Enter') {
        e.preventDefault();
        this.getSearchedProducts(<HTMLInputElement>input);
      }
    });
    btn.addEventListener('click', () => {
      this.getSearchedProducts(<HTMLInputElement>input);
    });
  }

  private getSearchedProducts(input: HTMLInputElement) {
    const search = (<HTMLInputElement>input).value;
    if (search) {
      const response = this.clientApi.getSearchProduct(search, 50);
      response
        .then((data) => {
          const { results } = data.body;
          if (results.length === 0) {
            this.showNoResults(search);
          } else {
            this.assamleCards(results).then((cardsView) => {
              if (this.wrapper) {
                const replacedNode = this.wrapper.getElement().childNodes[2];
                this.wrapper.getElement().replaceChild(cardsView.getElement(), replacedNode);
              }
            });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      // search is blank
      this.assamleCards().then((cardsView) => {
        if (this.wrapper) {
          const replacedNode = this.wrapper.getElement().childNodes[2];
          this.wrapper.getElement().replaceChild(cardsView.getElement(), replacedNode);
        }
      });
    }
  }

  private showNoResults(search: string, filter = false) {
    const container = new ElementCreator(catalogParams.noResults.container);
    const title = new ElementCreator(catalogParams.noResults.title);
    const message = new ElementCreator(catalogParams.noResults.message);
    if (filter) {
      message.getElement().innerHTML = 'No Results Found. Please, choose another filters';
    } else {
      message.getElement().innerHTML = `No Results for <span>"${search}"</span>. Please, try another search.`;
    }
    container.addInnerElement([title, message]);
    if (this.wrapper) {
      const replacedNode = this.wrapper.getElement().childNodes[2];
      this.wrapper.getElement().replaceChild(container.getElement(), replacedNode);
    }
  }

  private async getCategoriesView() {
    const productCards = new ElementCreator(catalogParams.productCards);
    const heading = new ElementCreator(catalogParams.categoriesPage.pageHeading);
    productCards.addInnerElement(heading);
    this.prefetchedData.genres.forEach(async (item) => {
      const data = await this.clientApi.getSpecificGenreById(item.id);
      if (data) {
        const dataResults = data.results;
        const catWrapper = new ElementCreator(catalogParams.categoriesPage.categoryWrapper);
        const catHeading = new ElementCreator(catalogParams.categoriesPage.categoryHeading);
        catHeading.setTextContent(item.name);
        const cards = await this.assamleCards(dataResults);
        catWrapper.addInnerElement([catHeading, cards]);
        productCards.addInnerElement(catWrapper);
      }
    });
    return productCards;
  }

  public async proceedToCategories() {
    const productCards = await this.getCategoriesView();
    this.updateCrumbNavigation();
    if (productCards) {
      if (!this.wrapper) {
        this.configure(undefined, productCards);
      } else {
        this.replaceCards(this.wrapper, productCards);
      }
    }
  }

  public async proceedToCatalog() {
    const productCards = await this.getCategoriesView();
    this.updateCrumbNavigation();
    if (productCards) {
      if (!this.wrapper) {
        this.configure(undefined, productCards);
      } else {
        this.replaceCards(this.wrapper, productCards);
      }
    }
  }

  public updateCrumbNavigation() {
    this.bcWrapper.replaceChildren(...this.createBreadCrumbs());
  }

  private createBreadCrumbs() {
    const url = this.router.currentPath.split('/');
    const crumbs = url
      .filter((item) => item !== '')
      .map((item, i, arr) => {
        const itemWrapper = new ElementCreator(catalogParams.breadCrumbs.linkContainer);
        let link = new ElementCreator(catalogParams.breadCrumbs.bcLink);
        if (arr.length === i + 1) {
          link = new ElementCreator(catalogParams.breadCrumbs.bcLinkActive);
        }
        link.setTextContent(item.split('_').join(' '));
        const path = `${arr[0]}/${arr.slice(1, i + 1).join('/')}`;
        link.setAttribute('href', path);
        link.setMouseEvent((evt) => {
          evt.preventDefault();
          if (evt.target instanceof HTMLAnchorElement) {
            const pathname = evt.target.pathname.slice(1);
            if (window.location.pathname.slice(1) === pathname) {
              return false;
            }
            this.router.navigate(path);
          }
        });
        itemWrapper.addInnerElement(link);
        return itemWrapper.getElement();
      });
    return crumbs;
  }

  public get breadCrumbWrapper() {
    const wrapper = new ElementCreator(catalogParams.breadCrumbs.wrapper);
    wrapper.addInnerElement(this.createBreadCrumbs());
    return wrapper.getElement();
  }

  public get getWrapper() {
    if (this.wrapper) {
      return this.wrapper;
    }
    return console.error('catalog wrapper not found!');
  }
}
