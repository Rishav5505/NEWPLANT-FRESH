import { Button } from "../components/ui";

export default function NotFound() {
  return (
    <section className="container-x grid min-h-[70vh] items-center gap-10 py-16 md:grid-cols-2">
      <div>
        <p className="font-display text-[8rem] leading-none font-light text-clay italic">404</p>
        <h1 className="mt-4 text-4xl md:text-5xl">This path is <em className="text-moss">overgrown.</em></h1>
        <p className="mt-4 max-w-sm text-muted">The page you're looking for has been repotted, renamed or never sprouted at all.</p>
        <div className="mt-8 flex gap-3">
          <Button to="/">Back home</Button>
          <Button to="/shop" variant="outline">Shop plants</Button>
        </div>
      </div>
      <img src="/images/hd/cactus.jpg" alt="A small cactus in an orange pot" className="mx-auto h-[420px] w-72 object-cover arch shadow-2xl" />
    </section>
  );
}
