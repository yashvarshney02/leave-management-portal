echo "Building"
npm run build

echo "Deploying"
scp -r build/* dep_t24_lmp@172.30.8.214:/var/www/172.30.8.214/

echo "Done!"