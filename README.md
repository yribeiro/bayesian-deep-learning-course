# Interactive Bayesian Deep Learning Course Explorer

This project is an interactive course explorer for "Practical Bayesian Deep Learning," built with [Next.js](https://nextjs.org) and deployed to GitHub Pages.

## Running Locally

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/your-repository-name.git # Replace with actual URL
    cd your-repository-name # Replace with actual directory
    ```
2.  Install dependencies. This project uses npm:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

You can start editing the main page by modifying `app/page.js`. The page auto-updates as you edit the file.

## Deployment

This site is built with Next.js and deployed to GitHub Pages. The deployment process is automated using GitHub Actions, configured in `.github/workflows/static.yml`.

When changes are pushed to the `main` branch, the workflow automatically:
1. Builds the Next.js application.
2. Exports it as static HTML, CSS, and JavaScript files (the `npm run export` script handles this, placing files in the `out` directory).
3. Deploys these static files to the `gh-pages` branch, making them live on GitHub Pages.

## Learn More about Next.js

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
