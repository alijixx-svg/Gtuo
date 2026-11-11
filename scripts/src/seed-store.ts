import { runMigrations } from "stripe-replit-sync";
import { getUncachableStripeClient, getStripeSync } from "./stripeClient";

const tmdb = (path: string) => `https://image.tmdb.org/t/p/original/${path}`;
const steamPoster = (id: number) => `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/library_600x900_2x.jpg`;
const steamBackdrop = (id: number) => `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/library_hero.jpg`;

// Illustrative catalog only. Stripe test products do not grant real content licenses.
const catalog = [
  {
    slug: "dune-part-two", title: "Dune: Part Two", titleAr: "كثيب: الجزء الثاني",
    category: "movie", genre: "خيال علمي", price: 1499, originalPrice: 1999,
    imageUrl: tmdb("1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg"),
    backdropUrl: tmdb("xOMo8BRK7PfcJvFtBgXNxmpg98e.jpg"),
    description: "انضم إلى بول أتريدس في رحلة استثنائية على كوكب أراكس، حيث تتقاطع المصائر وتتغير موازين القوة. منتج توضيحي للتدريب على الدفع، ولا يتضمن مشاهدة أو تنزيلًا.",
    year: 2024, rating: 8.5, platform: "4K UHD", featured: true, badge: "اختيار سين",
  },
  {
    slug: "cyberpunk-2077", title: "Cyberpunk 2077", titleAr: "سايبربنك 2077",
    category: "game", genre: "عالم مفتوح", price: 2999, originalPrice: 5999,
    imageUrl: steamPoster(1091500), backdropUrl: steamBackdrop(1091500),
    description: "استكشف نايت سيتي، المدينة التي لا تنام، في مغامرة تقمص أدوار مليئة بالقرارات والقصص. منتج توضيحي للتدريب على الدفع، ولا يتضمن مفتاح تفعيل.",
    year: 2023, rating: 9.1, platform: "PC · Steam", featured: true, badge: "خصم 50%",
  },
  {
    slug: "interstellar", title: "Interstellar", titleAr: "بين النجوم",
    category: "movie", genre: "خيال علمي", price: 999, originalPrice: 1499,
    imageUrl: tmdb("gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"),
    backdropUrl: tmdb("xJHokMbljvjADYdit5fK5VQsXEG.jpg"),
    description: "رحلة أبعد من حدود المجرة بحثًا عن مستقبل للبشرية. ملحمة كريستوفر نولان عن الزمن والحب والاكتشاف. نسخة تجريبية للمتجر، بلا محتوى قابل للتنزيل.",
    year: 2014, rating: 8.7, platform: "4K UHD", featured: false, badge: "الأكثر طلبًا",
  },
  {
    slug: "elden-ring", title: "Elden Ring", titleAr: "إلدن رينغ",
    category: "game", genre: "تقمص أدوار", price: 3999, originalPrice: 5999,
    imageUrl: steamPoster(1245620), backdropUrl: steamBackdrop(1245620),
    description: "اكتشف الأراضي الوسطى في مغامرة فانتازيا ملحمية، واصنع طريقك بين الممالك والأسرار. منتج تدريب تجريبي، لا يتضمن مفتاح تفعيل حقيقيًا.",
    year: 2022, rating: 9.6, platform: "PC · Steam", featured: true, badge: "الأكثر مبيعًا",
  },
  {
    slug: "oppenheimer", title: "Oppenheimer", titleAr: "أوبنهايمر",
    category: "movie", genre: "دراما", price: 1299, originalPrice: 1799,
    imageUrl: tmdb("ptpr0kGAckfQkJeJIt8st5dglvd.jpg"),
    backdropUrl: tmdb("rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg"),
    description: "قصة العالم الذي غيّر مجرى التاريخ، في دراما سينمائية من إخراج كريستوفر نولان. عرض توضيحي، لا يشمل ملف الفيلم أو حقوق عرضه.",
    year: 2023, rating: 8.3, platform: "4K UHD", featured: false, badge: "حائز على الأوسكار",
  },
  {
    slug: "red-dead-redemption-2", title: "Red Dead Redemption 2", titleAr: "ريد ديد ريدمبشن 2",
    category: "game", genre: "مغامرات", price: 1999, originalPrice: 5999,
    imageUrl: steamPoster(1174180), backdropUrl: steamBackdrop(1174180),
    description: "عش حكاية آرثر مورغان في الغرب الأمريكي، بين الرفاق والولاء وعالم يتغير بسرعة. عرض تجريبي لا يتضمن نسخة أو مفتاح لعبة حقيقيًا.",
    year: 2019, rating: 9.7, platform: "PC · Steam", featured: false, badge: "خصم 67%",
  },
  {
    slug: "the-batman", title: "The Batman", titleAr: "باتمان",
    category: "movie", genre: "أكشن", price: 899, originalPrice: 1499,
    imageUrl: tmdb("74xTEgt7R36Fpooo50r9T25onhq.jpg"),
    backdropUrl: tmdb("b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg"),
    description: "في شوارع غوثام الممطرة، يواجه باتمان لغزًا يختبر حدود العدالة. منتج توضيحي لا يشمل مشاهدة أو تنزيل الفيلم.",
    year: 2022, rating: 7.8, platform: "4K UHD", featured: false, badge: "",
  },
  {
    slug: "god-of-war", title: "God of War", titleAr: "غود أوف وور",
    category: "game", genre: "أكشن", price: 2499, originalPrice: 4999,
    imageUrl: steamPoster(1593500), backdropUrl: steamBackdrop(1593500),
    description: "مغامرة كريتوس وأتريوس بين أساطير الشمال ومخلوقاته، في قصة عن الأبوة والبدايات الجديدة. منتج تجريبي بلا مفتاح تفعيل.",
    year: 2022, rating: 9.4, platform: "PC · Steam", featured: false, badge: "خصم 50%",
  },
  {
    slug: "spider-verse", title: "Spider-Man: Across the Spider-Verse", titleAr: "سبايدرمان: عبر عالم العنكبوت",
    category: "movie", genre: "أنيميشن", price: 1199, originalPrice: 1599,
    imageUrl: tmdb("8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg"),
    backdropUrl: tmdb("4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg"),
    description: "مايلز موراليس ينطلق عبر الأكوان في مغامرة رسوم متحركة مبهرة عن الاختيار والانتماء. عرض توضيحي بلا ملفات مشاهدة.",
    year: 2023, rating: 8.6, platform: "4K UHD", featured: false, badge: "",
  },
  {
    slug: "hogwarts-legacy", title: "Hogwarts Legacy", titleAr: "هوغوورتس ليغاسي",
    category: "game", genre: "عالم مفتوح", price: 1799, originalPrice: 5999,
    imageUrl: steamPoster(990080), backdropUrl: steamBackdrop(990080),
    description: "اكتب قصتك الخاصة في عالم السحر، واستكشف هوغوورتس وما وراءها. منتج تدريبي للدفع التجريبي ولا يتضمن اللعبة.",
    year: 2023, rating: 8.5, platform: "PC · Steam", featured: false, badge: "عرض خاص",
  },
  {
    slug: "inception", title: "Inception", titleAr: "استهلال",
    category: "movie", genre: "إثارة", price: 799, originalPrice: 1299,
    imageUrl: tmdb("oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg"),
    backdropUrl: tmdb("s3TBrRGB1iav7gFOCNx3H31MoES.jpg"),
    description: "ادخل عالم الأحلام المتداخلة في مهمة لا تشبه أي مهمة أخرى. منتج متجر توضيحي، لا يتضمن ترخيص مشاهدة.",
    year: 2010, rating: 8.8, platform: "4K UHD", featured: false, badge: "",
  },
  {
    slug: "hades", title: "Hades", titleAr: "هيديز",
    category: "game", genre: "إندي", price: 1249, originalPrice: 2499,
    imageUrl: steamPoster(1145360), backdropUrl: steamBackdrop(1145360),
    description: "تحدّ عالم الأساطير اليونانية في مغامرة أكشن متجددة تحكي قصتها مع كل محاولة. نسخة توضيحية بلا محتوى أو مفتاح تفعيل.",
    year: 2020, rating: 9.3, platform: "PC · Steam", featured: false, badge: "خصم 50%",
  },
];

async function seed() {
  const directStripe = Boolean(process.env.STRIPE_SECRET_KEY);
  if (!directStripe && !process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const stripe = await getUncachableStripeClient();
  const existing = await stripe.products.list({ limit: 100, active: true });
  for (const [rank, item] of catalog.entries()) {
    const found = existing.data.find(p => p.metadata.scene_slug === item.slug);
    if (found) {
      // Repair a partially completed seed without duplicating the product.
      const prices = await stripe.prices.list({ product: found.id, active: true, limit: 1 });
      if (!prices.data.length) {
        const price = await stripe.prices.create({ product: found.id, currency: "usd", unit_amount: item.price });
        await stripe.products.update(found.id, { default_price: price.id });
      }
      continue;
    }
    const { title, description, price, originalPrice, ...rest } = item;
    const metadata = Object.fromEntries(
      Object.entries({ ...rest, originalPrice: originalPrice / 100, rank, scene_slug: item.slug, scene_store: "true" })
        .map(([key, value]) => [key, String(value)]),
    );
    const product = await stripe.products.create({
      name: title,
      description,
      images: [item.imageUrl],
      metadata,
    });
    const stripePrice = await stripe.prices.create({ product: product.id, currency: "usd", unit_amount: price });
    await stripe.products.update(product.id, { default_price: stripePrice.id });
    console.info(`Created test catalog item: ${title}`);
  }
  if (!directStripe) {
    await runMigrations({ databaseUrl: process.env.DATABASE_URL! });
    const sync = await getStripeSync();
    await sync.syncBackfill({ object: "all" });
    console.info("SCENE test catalog synced");
  } else {
    console.info("SCENE test catalog ready in Stripe; no database migration was performed.");
  }
  process.exit(0);
}

seed().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown setup error";
  console.error("Catalog setup failed:", message.replace(/(?:sk|rk|pk)_(?:test|live)_[a-zA-Z0-9]+/g, "[redacted]"));
  process.exit(1);
});
