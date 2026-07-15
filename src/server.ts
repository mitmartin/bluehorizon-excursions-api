import { app } from './app.js';

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`Blue Horizon Excursions API listening on port ${port}`);
});
