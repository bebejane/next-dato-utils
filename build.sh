packages=(
  api
  cli
  components
  hooks
  route-handlers
  server-actions
  utils
)

rm -rf ${packages[@]}
rm index.*
rm *.d.ts

echo Target cleared...

for package in "${packages[@]}"; do
  pnpm microbundle -i src/$package/index.ts -o $package/index.js --tsconfig 'tsconfig-microbundle.json' --name ${package} --jsx React.createElement &
done

pnpm microbundle -i src/index.ts -o ./index.js --tsconfig 'tsconfig-microbundle.json' --name index --jsx React.createElement

wait

echo Build complete!