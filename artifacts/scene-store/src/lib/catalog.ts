import { useQuery } from "@tanstack/react-query";

export type StoreProduct = {
  id: string; slug: string; title: string; titleAr: string; description: string;
  category: "movie" | "game"; genre: string; price: number; originalPrice: number;
  currency: string; imageUrl: string; backdropUrl: string; year: number;
  rating: number; platform: string; featured: boolean; badge: string;
};
export type ListStoreProductsParams = {
  category?: "all" | "movie" | "game"; sort?: "popular" | "price-asc" | "price-desc" | "newest";
  q?: string; deals?: boolean;
};

// This is the display-only catalog, not a fallback for a payment service.
// Keep existing IDs so saved favorites, carts, and product links remain valid.
function movie(id: string, slug: string, title: string, titleAr: string, genre: string, price: number, originalPrice: number, year: number, rating: number, poster: string, backdrop: string, description: string, featured = false, badge = ""): StoreProduct {
  return { id, slug, title, titleAr, genre, price, originalPrice, year, rating, description, featured, badge,
    category: "movie", currency: "usd", platform: "4K UHD",
    imageUrl: `https://image.tmdb.org/t/p/original/${poster}`,
    backdropUrl: `https://image.tmdb.org/t/p/original/${backdrop}` };
}
function game(id: string, slug: string, title: string, titleAr: string, genre: string, price: number, originalPrice: number, year: number, rating: number, steamId: number, description: string, featured = false, badge = ""): StoreProduct {
  return { id, slug, title, titleAr, genre, price, originalPrice, year, rating, description, featured, badge,
    category: "game", currency: "usd", platform: "PC · Steam",
    imageUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/${steamId}/library_600x900_2x.jpg`,
    backdropUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/${steamId}/library_hero.jpg` };
}

export const catalog: StoreProduct[] = [
  movie("prod_VbCI9Gcn9mO2Jz", "dune-part-two", "Dune: Part Two", "كثيب: الجزء الثاني", "خيال علمي", 14.99, 19.99, 2024, 8.5, "1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg", "xOMo8BRK7PfcJvFtBgXNxmpg98e.jpg", "انضم إلى بول أتريدس في رحلة استثنائية على كوكب أراكس، حيث تتقاطع المصائر وتتغير موازين القوة.", true, "اختيار سين"),
  game("prod_VbCIcxjtKay4R1", "cyberpunk-2077", "Cyberpunk 2077", "سايبربنك 2077", "عالم مفتوح", 29.99, 59.99, 2023, 9.1, 1091500, "استكشف نايت سيتي، المدينة التي لا تنام، في مغامرة تقمص أدوار مليئة بالقرارات والقصص.", true, "خصم 50%"),
  movie("prod_VbCIAy8I7Jf5Pj", "interstellar", "Interstellar", "بين النجوم", "خيال علمي", 9.99, 14.99, 2014, 8.7, "gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", "xJHokMbljvjADYdit5fK5VQsXEG.jpg", "رحلة أبعد من حدود المجرة بحثًا عن مستقبل للبشرية. ملحمة كريستوفر نولان عن الزمن والحب والاكتشاف.", false, "اختيار المشاهدين"),
  game("prod_VbCIQ8IfTJ6UrB", "elden-ring", "Elden Ring", "إلدن رينغ", "تقمص أدوار", 39.99, 59.99, 2022, 9.6, 1245620, "اكتشف الأراضي الوسطى في مغامرة فانتازيا ملحمية، واصنع طريقك بين الممالك والأسرار.", true, "اختيار اللاعبين"),
  movie("prod_VbCITbjxMpv0RB", "oppenheimer", "Oppenheimer", "أوبنهايمر", "دراما", 12.99, 17.99, 2023, 8.3, "ptpr0kGAckfQkJeJIt8st5dglvd.jpg", "rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg", "قصة العالم الذي غيّر مجرى التاريخ، في دراما سينمائية من إخراج كريستوفر نولان.", false, "حائز على الأوسكار"),
  game("prod_VbCIkatyhTIm7A", "red-dead-redemption-2", "Red Dead Redemption 2", "ريد ديد ريدمبشن 2", "مغامرات", 19.99, 59.99, 2019, 9.7, 1174180, "عش حكاية آرثر مورغان في الغرب الأمريكي، بين الرفاق والولاء وعالم يتغير بسرعة.", false, "خصم 67%"),
  movie("prod_VbCIl2LZwovE0s", "the-batman", "The Batman", "باتمان", "أكشن", 8.99, 14.99, 2022, 7.8, "74xTEgt7R36Fpooo50r9T25onhq.jpg", "b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg", "في شوارع غوثام الممطرة، يواجه باتمان لغزًا يختبر حدود العدالة."),
  game("prod_VbCIo3Bnzhx8X6", "god-of-war", "God of War", "غود أوف وور", "أكشن", 24.99, 49.99, 2022, 9.4, 1593500, "مغامرة كريتوس وأتريوس بين أساطير الشمال ومخلوقاته، في قصة عن الأبوة والبدايات الجديدة.", false, "خصم 50%"),
  movie("prod_VbCIXjKmLWW4GC", "spider-verse", "Spider-Man: Across the Spider-Verse", "سبايدرمان: عبر عالم العنكبوت", "أنيميشن", 11.99, 15.99, 2023, 8.6, "8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg", "4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg", "مايلز موراليس ينطلق عبر الأكوان في مغامرة رسوم متحركة مبهرة عن الاختيار والانتماء."),
  game("prod_VbCIHjXUlP18BQ", "hogwarts-legacy", "Hogwarts Legacy", "هوغوورتس ليغاسي", "عالم مفتوح", 17.99, 59.99, 2023, 8.5, 990080, "اكتب قصتك الخاصة في عالم السحر، واستكشف هوغوورتس وما وراءها.", false, "عرض خاص"),
  movie("prod_VbCIoDtey6Lfy4", "inception", "Inception", "استهلال", "إثارة", 7.99, 12.99, 2010, 8.8, "oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg", "s3TBrRGB1iav7gFOCNx3H31MoES.jpg", "ادخل عالم الأحلام المتداخلة في مهمة لا تشبه أي مهمة أخرى."),
  game("prod_VbCIA5kFWomAZJ", "hades", "Hades", "هيديز", "إندي", 12.49, 24.99, 2020, 9.3, 1145360, "تحدّ عالم الأساطير اليونانية في مغامرة أكشن متجددة تحكي قصتها مع كل محاولة.", false, "خصم 50%"),
];

export function listProducts(params: ListStoreProductsParams = {}) {
  const search = params.q?.trim().toLocaleLowerCase() ?? "";
  const products = catalog.filter(p =>
    (!params.category || params.category === "all" || p.category === params.category) &&
    (!params.deals || p.originalPrice > p.price) &&
    (!search || `${p.title} ${p.titleAr} ${p.genre}`.toLocaleLowerCase().includes(search)));
  if (params.sort === "price-asc") products.sort((a, b) => a.price - b.price);
  if (params.sort === "price-desc") products.sort((a, b) => b.price - a.price);
  if (params.sort === "newest") products.sort((a, b) => b.year - a.year);
  return products;
}

export const getListStoreProductsQueryKey = (params: ListStoreProductsParams) => ["display-catalog", params];
export const getGetStoreProductQueryKey = (id: string) => ["display-product", id];
export const getGetStoreHighlightsQueryKey = () => ["display-highlights"];
export function useListStoreProducts(params: ListStoreProductsParams) {
  return useQuery({ queryKey: getListStoreProductsQueryKey(params), queryFn: () => listProducts(params), staleTime: Infinity });
}
export function useGetStoreProduct(id: string) {
  return useQuery({ queryKey: getGetStoreProductQueryKey(id), queryFn: () => {
    const product = catalog.find(p => p.id === id || p.slug === id);
    if (!product) throw new Error("العنوان غير موجود في الكتالوج");
    return product;
  }, retry: false, staleTime: Infinity });
}
export function useGetStoreHighlights() {
  return useQuery({ queryKey: getGetStoreHighlightsQueryKey(), queryFn: () => ({
    featured: catalog.filter(p => p.featured),
    trending: [...catalog].sort((a, b) => b.rating - a.rating).slice(0, 5),
    movieCount: catalog.filter(p => p.category === "movie").length,
    gameCount: catalog.filter(p => p.category === "game").length,
    dealsCount: catalog.filter(p => p.originalPrice > p.price).length,
  }), staleTime: Infinity });
}
