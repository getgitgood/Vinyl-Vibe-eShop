// import Noty from 'noty';
import { Attribute, Price, ProductDiscount, ProductProjection, TypedMoney, Image } from '@commercetools/platform-sdk';
// import Splide from '@splidejs/splide';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Splide } from '@splidejs/splide';
import { wrapperParams } from '../../constants';
// import PAGES from '../../router/utils/pages';
import Router from '../../router/Router';
import ClientAPI from '../../utils/Client';
import ElementCreator from '../../utils/ElementCreator';
import View from '../View';
import productParams from './product-params';
import sliderParams from './slider-params';
import Modal from '../../utils/Modal';

export default class ProductView extends View {
  clientAPI: ClientAPI;

  private router: Router;

  private productKey: string;

  constructor(router: Router, productKey: string) {
    super(productParams.section);
    this.router = router;
    this.productKey = productKey;
    this.clientAPI = new ClientAPI();
    this.render();
  }

  public render(): void {
    this.configure();
  }

  protected configure(): void {
    this.renderInnerWrapper();
  }

  private renderInnerWrapper(): void {
    const wrapper = new ElementCreator(wrapperParams);
    const innerWrapper = new ElementCreator(productParams.innerWrapper);

    this.injectProductSection(innerWrapper);
    // this.injectLoginForm(innerWrapper);
    // this.injectFormSubtitle(innerWrapper);

    // this.injectProductSection();

    wrapper.getElement().classList.add('product__wrapper');
    wrapper.addInnerElement(innerWrapper);
    super.addInnerElement(wrapper);
  }

  private injectProductSection(wrapper: ElementCreator) {
    const productDisplay = new ElementCreator(productParams.productDisplay);

    const getProduct = this.clientAPI.getProductById(this.productKey);
    getProduct
      .then((data) => {
        const { body } = data;
        this.fillProductPhotoSide(productDisplay, body);
        this.fillProductInfoSide(productDisplay, body);
        this.fillProductAside(productDisplay, body);
        this.fillAdditionalSide(productDisplay, body);
      })
      .catch((error) => {
        console.log(error);
      });

    wrapper.addInnerElement(productDisplay);
  }

  private fillProductInfoSide(wrapper: ElementCreator, body: ProductProjection) {
    const productSide = new ElementCreator(productParams.infoSide);
    const { name, masterVariant } = body;
    this.injectProductTitle(productSide, name['en-US']);
    const { attributes } = masterVariant;
    if (attributes) {
      this.injectProductSubtitle(productSide, attributes[0].value);
      this.injectProductInfo(productSide, attributes);
    }
    console.log(body, masterVariant);

    wrapper.addInnerElement(productSide);
  }

  private injectProductTitle(wrapper: ElementCreator, titleText: string): void {
    const title = new ElementCreator(productParams.productTitle).getElement();
    title.textContent = titleText;
    wrapper.addInnerElement(title);
  }

  private injectProductSubtitle(wrapper: ElementCreator, titleText: string): void {
    const title = new ElementCreator(productParams.productSubtitle).getElement();
    title.textContent = titleText;
    wrapper.addInnerElement(title);
  }

  private injectProductInfo(wrapper: ElementCreator, attributes: Attribute[]): void {
    const infoList = new ElementCreator(productParams.productInfo);

    const label = attributes[1].value;
    this.injectInfoItem(infoList, 'Label:', label);
    const LP = attributes[2].value.label;
    this.injectInfoItem(infoList, 'LP:', LP);
    const condition = attributes.length > 4 ? attributes[4].value : attributes[3].value;
    this.injectInfoItem(infoList, 'Condition:', condition);

    wrapper.addInnerElement(infoList);
  }

  private injectInfoItem(list: ElementCreator, label: string, text: string): void {
    const infoItem = new ElementCreator(productParams.productInfoItem);
    const itemLabel = new ElementCreator(productParams.productInfoItemLabel).getElement();
    itemLabel.textContent = label;
    const itemText = new ElementCreator(productParams.productInfoItemText).getElement();
    itemText.textContent = text;

    infoItem.addInnerElement([itemLabel, itemText]);
    list.addInnerElement(infoItem);
  }

  private fillProductPhotoSide(wrapper: ElementCreator, body: ProductProjection): void {
    const productSide = new ElementCreator(productParams.photoSide);

    const { masterVariant } = body;
    const { images } = masterVariant;
    if (!images) return;

    // TESTING
    // const imgParams = {
    //   tag: 'img',
    //   cssClasses: ['product__img'],
    // };
    // const img = new ElementCreator(imgParams);
    // img.setImageLink(images[0].url, 'vinyl photo');
    // productSide.addInnerElement(img);
    const mainCarousel = this.injectPhotoSlider(productSide, images);
    this.mainCarouselMpdal(mainCarousel, images);

    wrapper.addInnerElement(productSide);
  }

  // private injectPhotoSlider(wrapper: ElementCreator, images: Image[]): void {
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   const thubnailPar: ElementParamsType = {
  //     tag: 'div',
  //     cssClasses: ['splide'],
  //     id: 'thumbnail-slider',
  //   };
  //   const thubnail = new ElementCreator(thubnailPar);
  //   const trackPar: ElementParamsType = {
  //     tag: 'div',
  //     cssClasses: ['splide__track'],
  //   };
  //   const track = new ElementCreator(trackPar);
  //   const listPar: ElementParamsType = {
  //     tag: 'ul',
  //     cssClasses: ['splide__list'],
  //   };
  //   const list = new ElementCreator(listPar);
  //   const slidePar: ElementParamsType = {
  //     tag: 'li',
  //     cssClasses: ['splide__slide'],
  //   };
  //   const imgParams = {
  //     tag: 'img',
  //     cssClasses: ['product__img'],
  //   };
  //   images.forEach((img) => {
  //     const imgItem = new ElementCreator(imgParams);
  //     imgItem.setImageLink(img.url, img.label ? img.label : 'vinyl photo');
  //     const slide = new ElementCreator(slidePar);
  //     slide.addInnerElement(imgItem);
  //     list.addInnerElement(slide);
  //   });
  //   track.addInnerElement(list);
  //   thubnail.addInnerElement(track);
  //   // const img = new ElementCreator(imgParams);
  //   // img.setImageLink(images[0].url, 'vinyl photo');

  //   new Splide(thubnail.getElement(), {
  //     fixedWidth: 100,
  //     fixedHeight: 60,
  //     gap: 10,
  //     rewind: true,
  //     pagination: false,
  //     cover: true,
  //     isNavigation: true,
  //     breakpoints: {
  //       600: {
  //         fixedWidth: 60,
  //         fixedHeight: 44,
  //       },
  //     },
  //   }).mount();

  //   wrapper.addInnerElement(thubnail);
  // }

  private injectPhotoSlider(wrapper: ElementCreator, images: Image[]) {
    const mainCarousel = new ElementCreator(sliderParams.maincarousel);
    const track = new ElementCreator(sliderParams.track);
    const list = new ElementCreator(sliderParams.list);

    const thubnails = new ElementCreator(sliderParams.thubnails);
    const thubnailArr: HTMLElement[] = [];

    images.forEach((img) => {
      const slide = new ElementCreator(sliderParams.slide);
      const image = new ElementCreator(sliderParams.img);
      image.setImageLink(img.url, img.label ? img.label : 'vinyl photo');
      slide.addInnerElement(image);
      list.addInnerElement(slide);

      const thubnail = new ElementCreator(sliderParams.thubnail);
      const thubimg = new ElementCreator(sliderParams.img);
      thubimg.setImageLink(img.url, img.label ? img.label : 'vinyl photo');
      thubnail.addInnerElement(thubimg);
      thubnailArr.push(thubnail.getElement());
      thubnails.addInnerElement(thubnail);
    });
    track.addInnerElement(list);
    mainCarousel.addInnerElement(track);

    const splide = new Splide(mainCarousel.getElement(), {
      pagination: false,
    });

    thubnailArr.forEach((thub, ind) => {
      thub.addEventListener('click', () => {
        splide.go(ind);
      });
    });
    let current = thubnailArr[0];
    splide.on('mounted move', () => {
      const thumbnail = thubnailArr[splide.index];
      if (thumbnail) {
        if (current) {
          current.classList.remove('is-active');
        }
        thumbnail.classList.add('is-active');
        current = thumbnail;
      }
    });

    splide.mount();
    wrapper.addInnerElement([mainCarousel, thubnails]);
    return mainCarousel;
  }

  private mainCarouselMpdal(mainCarousel: ElementCreator, images: Image[]) {
    mainCarousel.getElement().addEventListener('click', () => {
      const modal = new Modal(['modal__product-slider']);
      const content = new ElementCreator(productParams.modalConent);
      this.injectPhotoSlider(content, images);
      modal.buildModal(content.getElement());
    });
  }

  private fillProductAside(wrapper: ElementCreator, body: ProductProjection): void {
    const productSide = new ElementCreator(productParams.productAside);
    const { masterVariant } = body;
    this.injectAsideTitle(productSide);
    const { prices, availability } = masterVariant;
    if (prices) this.injectProductPrice(productSide, prices[0]);
    if (availability !== undefined && availability.availableQuantity) {
      this.injectAviabilityInfo(productSide, availability.availableQuantity);
    }
    const addCartBtn = new ElementCreator(productParams.addToCartBtn);
    productSide.addInnerElement(addCartBtn);

    wrapper.addInnerElement(productSide);
  }

  private injectAsideTitle(wrapper: ElementCreator): void {
    const title = new ElementCreator(productParams.priceTitle);
    wrapper.addInnerElement(title);
  }

  private injectProductPrice(wrapper: ElementCreator, prices: Price): void {
    const priceBox = new ElementCreator(productParams.productPriceBox);
    if (prices.discounted) {
      this.injectDiscountedPrices(priceBox, prices);
    } else {
      const currPrice = new ElementCreator(productParams.productPriceCurrent).getElement();
      currPrice.textContent = this.formatMoney(prices.value);
      priceBox.addInnerElement(currPrice);
    }
    wrapper.addInnerElement(priceBox);
  }

  private injectDiscountedPrices(priceBox: ElementCreator, prices: Price): void {
    const currPrice = new ElementCreator(productParams.productPriceCurrent).getElement();
    if (prices.discounted === undefined) return;
    currPrice.textContent = this.formatMoney(prices.discounted.value);
    currPrice.classList.add('_discounted-price');
    const prevPriceBox = new ElementCreator(productParams.productPricePrevious).getElement();
    const prevPrice = new ElementCreator(productParams.productPricePrevText).getElement();
    prevPrice.textContent = this.formatMoney(prices.value);
    const discountText = new ElementCreator(productParams.discountText).getElement();
    const discountInfo = this.clientAPI.getDiscountById(prices.discounted.discount.id);
    discountInfo
      .then((data) => {
        // console.log('dis', data);
        const { body } = data;
        if (body.value.type === 'relative') {
          const amount = body.value.permyriad / 100;
          discountText.textContent += ` ${amount}%`;
        } else {
          const amount = body.value;
          discountText.textContent += ` $${amount}`;
        }
        prevPriceBox.append(prevPrice, discountText);
        priceBox.addInnerElement([currPrice, prevPriceBox]);
        this.injectDiscountInfo(priceBox, body);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  private injectDiscountInfo(aside: ElementCreator, body: ProductDiscount): void {
    const discountBox = new ElementCreator(productParams.discountInfoBox);
    const discountTitle = new ElementCreator(productParams.discountInfoTitle).getElement();
    discountTitle.textContent = body.name['en-US'];
    discountBox.addInnerElement(discountTitle);
    if (body.description) {
      const dicountText = new ElementCreator(productParams.discountInfoText).getElement();
      dicountText.textContent = body.description['en-US'];
      discountBox.addInnerElement(dicountText);
    }
    aside.addInnerElement(discountBox);
  }

  private formatMoney(price: TypedMoney): string {
    const moneyNumber = price.centAmount / (10 * price.fractionDigits);
    const moneyText = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currencyCode,
    }).format(moneyNumber);
    return moneyText;
  }

  private injectAviabilityInfo(wrapper: ElementCreator, quantity: number): void {
    const box = new ElementCreator(productParams.availabilityBox);
    const label = new ElementCreator(productParams.availabilityLabel);
    const text = new ElementCreator(productParams.availabilityText).getElement();
    text.textContent += String(quantity);
    box.addInnerElement([label, text]);

    wrapper.addInnerElement(box);
  }

  private fillAdditionalSide(wrapper: ElementCreator, body: ProductProjection): void {
    const productSide = new ElementCreator(productParams.additionalSide);
    const { description, masterVariant } = body;
    this.injectAdditionalTitle(productSide);
    if (description) this.injectDescription(productSide, description['en-US']);
    const { attributes } = masterVariant;
    if (attributes && attributes[3].name === 'track-list') this.injectTrackList(productSide, attributes[3].value);

    wrapper.addInnerElement(productSide);
  }

  private injectAdditionalTitle(wrapper: ElementCreator): void {
    const title = new ElementCreator(productParams.additionalTitle);
    wrapper.addInnerElement(title);
  }

  private injectDescription(wrapper: ElementCreator, text: string): void {
    const description = new ElementCreator(productParams.descriptionProduct).getElement();
    description.textContent = text;
    wrapper.addInnerElement(description);
  }

  private injectTrackList(wrapper: ElementCreator, text: string): void {
    const trackListTitle = new ElementCreator(productParams.trackListTitle);
    const trackList = new ElementCreator(productParams.trackList).getElement();
    const trackArr = text.split('\n');
    trackArr.forEach((track) => {
      const item = new ElementCreator(productParams.trackListItem).getElement();
      item.textContent = track;
      trackList.append(item);
    });

    trackList.append();
    wrapper.addInnerElement([trackListTitle, trackList]);
  }
}
