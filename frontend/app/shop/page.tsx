async function delay(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
export default async function ShopPage() {
  await delay(3000); // force loading for 3 seconds

    <div>ShopPage</div>

}
