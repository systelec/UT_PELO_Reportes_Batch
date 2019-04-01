command bash ./getenv.sh

if [ $MODE = "dev" ]; then
    echo "Ejecutando servidor en modo desarrollo"
    command adonis serve --dev
fi

if [ $MODE = "prod" ]; then 
    echo "Ejecutando servidor en modo produccion"
    command bash ./build.sh
fi