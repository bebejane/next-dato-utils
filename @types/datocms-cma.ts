import { ItemTypeDefinition } from '@datocms/cma-client';
type EnvironmentSettings = {
  locales: 'en' | 'sv' | 'no' | 'da' | 'en-GB';
};
export type Term = ItemTypeDefinition<
  EnvironmentSettings,
  'FXlY1YXYQXCnlE6YrQ2K9w',
  {
    title: {
      type: 'string';
    };
    text: {
      type: 'structured_text';
    };
    category: {
      type: 'link';
    };
  }
>;
export type TermCategory = ItemTypeDefinition<
  EnvironmentSettings,
  'EFtwhOeaRRC1ZPgMYSmk3Q',
  {
    title: {
      type: 'string';
    };
  }
>;
export type TermStart = ItemTypeDefinition<
  EnvironmentSettings,
  'aEtvaDzBSmOO5dNfhcSrlg',
  {
    title: {
      type: 'string';
    };
    intro: {
      type: 'text';
    };
  }
>;
export type Lightsource = ItemTypeDefinition<
  EnvironmentSettings,
  '1801306',
  {
    lightsource: {
      type: 'link';
    };
    amount: {
      type: 'integer';
    };
    included: {
      type: 'boolean';
    };
    optional: {
      type: 'boolean';
    };
  }
>;
export type ProductModel = ItemTypeDefinition<
  EnvironmentSettings,
  '1801307',
  {
    name: {
      type: 'link';
    };
    variants: {
      type: 'rich_text';
      blocks: Variant;
    };
    drawing: {
      type: 'file';
    };
    lightsources: {
      type: 'rich_text';
      blocks: Lightsource;
    };
    accessories: {
      type: 'rich_text';
      blocks: Accessory;
    };
  }
>;
export type Accessory = ItemTypeDefinition<
  EnvironmentSettings,
  '1801309',
  {
    accessory: {
      type: 'link';
    };
  }
>;
export type FullwidthImage = ItemTypeDefinition<
  EnvironmentSettings,
  '1995883',
  {
    image: {
      type: 'file';
    };
  }
>;
export type TwoColumnImage = ItemTypeDefinition<
  EnvironmentSettings,
  '1995884',
  {
    first_image: {
      type: 'file';
    };
    last_image: {
      type: 'file';
    };
  }
>;
export type Text = ItemTypeDefinition<
  EnvironmentSettings,
  '1995885',
  {
    text: {
      type: 'structured_text';
      inline_blocks: Designer | Product | Project;
    };
  }
>;
export type Video = ItemTypeDefinition<
  EnvironmentSettings,
  '1995887',
  {
    video: {
      type: 'file';
    };
  }
>;
export type ImageGallery = ItemTypeDefinition<
  EnvironmentSettings,
  '1995888',
  {
    gallery: {
      type: 'gallery';
    };
  }
>;
export type FullscreenMediaBlock = ItemTypeDefinition<
  EnvironmentSettings,
  '1995908',
  {
    sub_headline: {
      type: 'string';
    };
    headline: {
      type: 'string';
    };
    media: {
      type: 'file';
    };
    link_record: {
      type: 'link';
    };
    read_more: {
      type: 'string';
    };
    make_darker: {
      type: 'boolean';
    };
  }
>;
export type Featured = ItemTypeDefinition<
  EnvironmentSettings,
  '1995909',
  {
    headline: {
      type: 'string';
    };
    items: {
      type: 'links';
    };
    show_mark_as_new: {
      type: 'boolean';
    };
  }
>;
export type ImageLink = ItemTypeDefinition<
  EnvironmentSettings,
  '1995913',
  {
    first_image: {
      type: 'file';
    };
    first_headline: {
      type: 'string';
    };
    first_link_text: {
      type: 'string';
    };
    first_link: {
      type: 'string';
    };
    second_image: {
      type: 'file';
    };
    second_headline: {
      type: 'string';
    };
    second_link_text: {
      type: 'string';
    };
    second_link: {
      type: 'string';
    };
  }
>;
export type FullscreenVideo = ItemTypeDefinition<
  EnvironmentSettings,
  '1995914',
  {
    video: {
      type: 'file';
    };
    text: {
      type: 'text';
    };
    link_text: {
      type: 'string';
    };
    link: {
      type: 'string';
    };
  }
>;
export type BespokeProject = ItemTypeDefinition<
  EnvironmentSettings,
  '1996017',
  {
    summary: {
      type: 'text';
    };
    project: {
      type: 'link';
    };
  }
>;
export type AboutSection = ItemTypeDefinition<
  EnvironmentSettings,
  '1996034',
  {
    text: {
      type: 'text';
    };
    video: {
      type: 'file';
    };
  }
>;
export type NewsItem = ItemTypeDefinition<
  EnvironmentSettings,
  '2000409',
  {
    news: {
      type: 'link';
    };
  }
>;
export type SustainabilityStep = ItemTypeDefinition<
  EnvironmentSettings,
  '2000787',
  {
    title: {
      type: 'string';
    };
    text: {
      type: 'text';
    };
    media: {
      type: 'file';
    };
    full_width_image: {
      type: 'boolean';
    };
  }
>;
export type FeaturedStart = ItemTypeDefinition<
  EnvironmentSettings,
  '2001048',
  {
    headline: {
      type: 'string';
    };
    items: {
      type: 'links';
    };
  }
>;
export type Social = ItemTypeDefinition<
  EnvironmentSettings,
  '2022630',
  {
    instagram: {
      type: 'json';
    };
  }
>;
export type Variant = ItemTypeDefinition<
  EnvironmentSettings,
  '1801308',
  {
    article_no: {
      type: 'string';
    };
    color: {
      type: 'link';
    };
    material: {
      type: 'link';
    };
    feature: {
      type: 'link';
    };
    weight: {
      type: 'float';
    };
    volume: {
      type: 'float';
    };
    price: {
      type: 'float';
    };
    delivery_days: {
      type: 'string';
    };
    image: {
      type: 'file';
    };
  }
>;
export type News = ItemTypeDefinition<
  EnvironmentSettings,
  '1995930',
  {
    title: {
      type: 'string';
    };
    text: {
      type: 'text';
    };
    image: {
      type: 'file';
    };
    link_text: {
      type: 'string';
    };
    link: {
      type: 'string';
    };
    slug: {
      type: 'slug';
    };
  }
>;
export type Translation = ItemTypeDefinition<
  EnvironmentSettings,
  '1801300',
  {
    page: {
      type: 'string';
    };
    value: {
      type: 'string';
      localized: true;
    };
    key: {
      type: 'string';
    };
  }
>;
export type ProductFeature = ItemTypeDefinition<
  EnvironmentSettings,
  '1801299',
  {
    name: {
      type: 'string';
      localized: true;
    };
  }
>;
export type ProductCategory = ItemTypeDefinition<
  EnvironmentSettings,
  '1801301',
  {
    name: {
      type: 'string';
      localized: true;
    };
    name_plural: {
      type: 'string';
      localized: true;
    };
    description: {
      type: 'text';
      localized: true;
    };
    position: {
      type: 'integer';
    };
  }
>;
export type ProductSocket = ItemTypeDefinition<
  EnvironmentSettings,
  '1801304',
  {
    name: {
      type: 'string';
    };
  }
>;
export type ProjectType = ItemTypeDefinition<
  EnvironmentSettings,
  '1995924',
  {
    title: {
      type: 'string';
    };
    title_plural: {
      type: 'string';
    };
    position: {
      type: 'integer';
    };
  }
>;
export type Faq = ItemTypeDefinition<
  EnvironmentSettings,
  '1995928',
  {
    question: {
      type: 'string';
    };
    answer: {
      type: 'text';
    };
    category: {
      type: 'link';
    };
  }
>;
export type Country = ItemTypeDefinition<
  EnvironmentSettings,
  '1990287',
  {
    name: {
      type: 'string';
      localized: true;
    };
  }
>;
export type ColorMaterialType = ItemTypeDefinition<
  EnvironmentSettings,
  '2011958',
  {
    category: {
      type: 'string';
    };
    category_plural: {
      type: 'string';
    };
    position: {
      type: 'integer';
    };
  }
>;
export type FaqCategory = ItemTypeDefinition<
  EnvironmentSettings,
  '1995929',
  {
    title: {
      type: 'string';
    };
  }
>;
export type Job = ItemTypeDefinition<
  EnvironmentSettings,
  '1995931',
  {
    title: {
      type: 'string';
    };
    summary: {
      type: 'text';
    };
    text: {
      type: 'text';
    };
    slug: {
      type: 'slug';
    };
  }
>;
export type Press = ItemTypeDefinition<
  EnvironmentSettings,
  '1996306',
  {
    title: {
      type: 'string';
    };
    url: {
      type: 'string';
    };
  }
>;
export type Staff = ItemTypeDefinition<
  EnvironmentSettings,
  '1990321',
  {
    image: {
      type: 'file';
    };
    name: {
      type: 'string';
    };
    role: {
      type: 'string';
    };
    phone: {
      type: 'string';
    };
    email: {
      type: 'string';
    };
    position: {
      type: 'integer';
    };
  }
>;
export type Showroom = ItemTypeDefinition<
  EnvironmentSettings,
  '1996028',
  {
    city: {
      type: 'string';
    };
    address: {
      type: 'text';
    };
    additional: {
      type: 'text';
    };
    image: {
      type: 'file';
    };
    position: {
      type: 'integer';
    };
  }
>;
export type Catalogue = ItemTypeDefinition<
  EnvironmentSettings,
  '2010205',
  {
    pdf: {
      type: 'file';
    };
    thumbnail: {
      type: 'file';
    };
    title: {
      type: 'string';
    };
  }
>;
export type ColorMaterial = ItemTypeDefinition<
  EnvironmentSettings,
  '2011957',
  {
    image: {
      type: 'file';
    };
    description: {
      type: 'string';
    };
    category: {
      type: 'link';
    };
    position: {
      type: 'integer';
    };
  }
>;
export type ProductElectrical = ItemTypeDefinition<
  EnvironmentSettings,
  '1801303',
  {
    name: {
      type: 'string';
      localized: true;
    };
  }
>;
export type ProductDimmable = ItemTypeDefinition<
  EnvironmentSettings,
  '1801305',
  {
    name: {
      type: 'string';
      localized: true;
    };
  }
>;
export type Product = ItemTypeDefinition<
  EnvironmentSettings,
  '1801291',
  {
    hide_in_pricelist: {
      type: 'boolean';
    };
    light_file: {
      type: 'file';
    };
    image: {
      type: 'file';
    };
    models: {
      type: 'rich_text';
      blocks: ProductModel;
    };
    categories: {
      type: 'links';
    };
    environment_image: {
      type: 'file';
    };
    color_images: {
      type: 'gallery';
    };
    title: {
      type: 'string';
    };
    mounting_instructions: {
      type: 'file';
    };
    family: {
      type: 'link';
    };
    designer: {
      type: 'link';
    };
    bim_file: {
      type: 'file';
    };
    mark_as_new: {
      type: 'boolean';
    };
    pdf_file: {
      type: 'file';
      localized: true;
    };
    product_gallery: {
      type: 'rich_text';
      blocks: FullwidthImage | TwoColumnImage | Text | Video | ImageGallery;
    };
    upcycled: {
      type: 'boolean';
    };
    additional_information: {
      type: 'string';
      localized: true;
    };
    bim_link: {
      type: 'string';
    };
    note: {
      type: 'text';
      localized: true;
    };
    description: {
      type: 'text';
      localized: true;
    };
    electrical_data: {
      type: 'links';
    };
    sockets: {
      type: 'links';
    };
    dimmable: {
      type: 'link';
    };
    connection: {
      type: 'link';
    };
    mounting: {
      type: 'link';
    };
    slug: {
      type: 'slug';
    };
  }
>;
export type ProductModelName = ItemTypeDefinition<
  EnvironmentSettings,
  '1801298',
  {
    name: {
      type: 'string';
      localized: true;
    };
  }
>;
export type ProductAccessory = ItemTypeDefinition<
  EnvironmentSettings,
  'ZU6qDmJWRnGkIqsGWmJa2A',
  {
    name: {
      type: 'string';
      localized: true;
    };
    article_no: {
      type: 'string';
    };
    price: {
      type: 'integer';
    };
    delivery_days: {
      type: 'string';
    };
    image: {
      type: 'file';
    };
    slug: {
      type: 'slug';
    };
  }
>;
export type Designer = ItemTypeDefinition<
  EnvironmentSettings,
  '1801302',
  {
    image: {
      type: 'file';
    };
    name: {
      type: 'string';
    };
    description: {
      type: 'text';
      localized: true;
    };
    slug: {
      type: 'slug';
    };
  }
>;
export type Reseller = ItemTypeDefinition<
  EnvironmentSettings,
  '1990290',
  {
    name: {
      type: 'string';
    };
    address: {
      type: 'text';
    };
    postal_code: {
      type: 'string';
    };
    city: {
      type: 'string';
    };
    country: {
      type: 'link';
    };
    url: {
      type: 'string';
    };
  }
>;
export type ProductConnection = ItemTypeDefinition<
  EnvironmentSettings,
  '1801297',
  {
    name: {
      type: 'string';
      localized: true;
    };
  }
>;
export type ProductMaterial = ItemTypeDefinition<
  EnvironmentSettings,
  '1801295',
  {
    name: {
      type: 'string';
      localized: true;
    };
  }
>;
export type ProductMounting = ItemTypeDefinition<
  EnvironmentSettings,
  '1801293',
  {
    name: {
      type: 'string';
      localized: true;
    };
  }
>;
export type ProductFamily = ItemTypeDefinition<
  EnvironmentSettings,
  '1801294',
  {
    name: {
      type: 'string';
    };
    slug: {
      type: 'slug';
    };
  }
>;
export type Distributor = ItemTypeDefinition<
  EnvironmentSettings,
  '1990316',
  {
    name: {
      type: 'string';
    };
    address: {
      type: 'text';
    };
    postal_code: {
      type: 'string';
    };
    city: {
      type: 'string';
    };
    country: {
      type: 'link';
    };
    contact_name: {
      type: 'string';
    };
    phone: {
      type: 'string';
    };
    email: {
      type: 'string';
    };
    url: {
      type: 'string';
    };
  }
>;
export type ProductColor = ItemTypeDefinition<
  EnvironmentSettings,
  '1801296',
  {
    name: {
      type: 'string';
      localized: true;
    };
  }
>;
export type Project = ItemTypeDefinition<
  EnvironmentSettings,
  '1995922',
  {
    image: {
      type: 'file';
    };
    secondary_image: {
      type: 'file';
    };
    title: {
      type: 'string';
    };
    location: {
      type: 'string';
    };
    project_type: {
      type: 'link';
    };
    bespoke: {
      type: 'boolean';
    };
    gallery: {
      type: 'rich_text';
      blocks: FullwidthImage | ImageGallery | TwoColumnImage | Text | Video;
    };
    related_products: {
      type: 'links';
    };
    slug: {
      type: 'slug';
    };
  }
>;
export type ProductLightsource = ItemTypeDefinition<
  EnvironmentSettings,
  '1801292',
  {
    name: {
      type: 'string';
      localized: true;
    };
    article_no: {
      type: 'string';
    };
    price: {
      type: 'float';
    };
    delivery_days: {
      type: 'string';
    };
    image: {
      type: 'file';
    };
    slug: {
      type: 'slug';
    };
  }
>;
export type ProjectStart = ItemTypeDefinition<
  EnvironmentSettings,
  '1996015',
  {
    title: {
      type: 'string';
    };
    intro: {
      type: 'text';
    };
  }
>;
export type About = ItemTypeDefinition<
  EnvironmentSettings,
  '1996033',
  {
    title: {
      type: 'text';
    };
    intro: {
      type: 'text';
    };
    video: {
      type: 'file';
    };
    sections: {
      type: 'rich_text';
      blocks: AboutSection;
    };
  }
>;
export type ColorMaterialIntro = ItemTypeDefinition<
  EnvironmentSettings,
  '2011967',
  {
    intro: {
      type: 'text';
    };
  }
>;
export type FaqStart = ItemTypeDefinition<
  EnvironmentSettings,
  '1996031',
  {
    title: {
      type: 'string';
    };
    intro: {
      type: 'text';
    };
  }
>;
export type Manual = ItemTypeDefinition<
  EnvironmentSettings,
  '1996032',
  {
    title: {
      type: 'string';
    };
    intro: {
      type: 'text';
    };
  }
>;
export type Sustainability = ItemTypeDefinition<
  EnvironmentSettings,
  '1996030',
  {
    title: {
      type: 'string';
    };
    intro: {
      type: 'text';
    };
    image: {
      type: 'file';
    };
    steps: {
      type: 'rich_text';
      blocks: SustainabilityStep;
    };
  }
>;
export type ProductStart = ItemTypeDefinition<
  EnvironmentSettings,
  '1996014',
  {
    featured: {
      type: 'rich_text';
      blocks: Featured;
    };
  }
>;
export type Start = ItemTypeDefinition<
  EnvironmentSettings,
  '1995907',
  {
    content: {
      type: 'rich_text';
      blocks:
        | FullscreenMediaBlock
        | ImageLink
        | FullscreenVideo
        | NewsItem
        | FeaturedStart;
    };
  }
>;
export type Bespoke = ItemTypeDefinition<
  EnvironmentSettings,
  '1996016',
  {
    thumbnail: {
      type: 'file';
    };
    secondary_thumbnail: {
      type: 'file';
    };
    title: {
      type: 'string';
    };
    intro: {
      type: 'text';
    };
    outro: {
      type: 'text';
    };
    examples: {
      type: 'rich_text';
      blocks: BespokeProject;
    };
    image: {
      type: 'file';
    };
  }
>;
export type FactoryVisit = ItemTypeDefinition<
  EnvironmentSettings,
  '1996019',
  {
    title: {
      type: 'string';
    };
    intro: {
      type: 'text';
    };
  }
>;
export type DownloadsStart = ItemTypeDefinition<
  EnvironmentSettings,
  '1996018',
  {
    title: {
      type: 'string';
    };
    intro: {
      type: 'text';
    };
  }
>;
export type Contact = ItemTypeDefinition<
  EnvironmentSettings,
  '1996025',
  {
    title: {
      type: 'string';
    };
    intro: {
      type: 'text';
    };
    address: {
      type: 'text';
    };
    phone: {
      type: 'string';
    };
    email: {
      type: 'string';
    };
    showroom_intro: {
      type: 'text';
    };
    contact_form_message: {
      type: 'text';
    };
    image: {
      type: 'file';
    };
  }
>;
export type AnyBlock =
  | Lightsource
  | ProductModel
  | Accessory
  | FullwidthImage
  | TwoColumnImage
  | Text
  | Video
  | ImageGallery
  | FullscreenMediaBlock
  | Featured
  | ImageLink
  | FullscreenVideo
  | BespokeProject
  | AboutSection
  | NewsItem
  | SustainabilityStep
  | FeaturedStart
  | Variant;
export type AnyModel =
  | Term
  | TermCategory
  | TermStart
  | Social
  | News
  | Translation
  | ProductFeature
  | ProductCategory
  | ProductSocket
  | ProjectType
  | Faq
  | Country
  | ColorMaterialType
  | FaqCategory
  | Job
  | Press
  | Staff
  | Showroom
  | Catalogue
  | ColorMaterial
  | ProductElectrical
  | ProductDimmable
  | Product
  | ProductModelName
  | ProductAccessory
  | Designer
  | Reseller
  | ProductConnection
  | ProductMaterial
  | ProductMounting
  | ProductFamily
  | Distributor
  | ProductColor
  | Project
  | ProductLightsource
  | ProjectStart
  | About
  | ColorMaterialIntro
  | FaqStart
  | Manual
  | Sustainability
  | ProductStart
  | Start
  | Bespoke
  | FactoryVisit
  | DownloadsStart
  | Contact;
export type AnyBlockOrModel = AnyBlock | AnyModel;
