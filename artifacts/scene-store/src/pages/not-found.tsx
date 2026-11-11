import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-mono text-7xl font-bold text-primary">404</p>
      <h1 className="font-display mt-4 text-4xl">هذا المشهد انحذف من النسخة النهائية.</h1>
      <Link href="/" data-testid="link-home-404" className="mt-8 inline-block rounded-full bg-secondary px-6 py-3 font-bold text-secondary-foreground">العودة للمتجر</Link>
    </div>
  );
}
