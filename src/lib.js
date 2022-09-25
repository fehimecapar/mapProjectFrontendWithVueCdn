  //vue nesnemizi oluşturup id'si "app" olan div'e eriştik.
  var app = new Vue({
    el: "#app",
    //data kısmında tutlan veriler uygulamaya dahil edilebilir
    data: {
        //sayfa ilk açıldığında gidilecek lokasyonlar ve yaklaştırma miktarı
        lat: 37.719,
        lng: 36.079,
        zoom: 6,
        // haritada aranan yerler, post olarak node tarafına gönderilecek
        searched_data_il: '',
        //map tanımı
        map: {},
        arrOfObj: {},
        watch: false,//bunun icine doldurcam
        result_array: [],//
    },
    // mounted sayfaların açılışında ilk çağırılan yapıdır.
    mounted() {
        const provider = new GeoSearch.OpenStreetMapProvider();

        var southWest = L.latLng(40.712, -74.227),
        northEast = L.latLng(40.774, -74.125),
        mybounds = L.latLngBounds(southWest, northEast);

        
        this.map = L.map('map', {
            zoomControl: false,
            center: [this.lat, this.lng],
            zoom: this.zoom,
            bounds: mybounds,
            maxZoom: 18,
            minZoom: 3
        });
        const search = new GeoSearch.GeoSearchControl({
            provider: new GeoSearch.OpenStreetMapProvider(),
        });
        //map types
        const basemaps = {
            StreetView: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://bul.com.tr/">bul.com</a>' }),
            Satellite: L.tileLayer.wms('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png', { layers: 'STLLT-IMGRY' }),
        };
        var results = L.layerGroup().addTo(this.map);
        L.control.layers(basemaps).addTo(this.map);
        basemaps.StreetView.addTo(this.map);
    },
    methods: {
        async keyData(e) {
            const value = event.target.value
            //console.log(value);
            await axios.get(`https://harita2.bul.com.tr/api/search?q=${value}`)
                .then(res => {
                    if (res.status == 200) {
                        this.watch = true;
                        this.result_array = res.data;
                        //console.log(this.result_array);
                    }
                }).catch(err => {
                    console.log(err)
                })
        },
        async getData() {
            this.searched_data_il = document.getElementById("adres_data_il").value;
            this.arrOfObj =
                {
                    key1: this.searched_data_il,
                }
            await axios.post('https://harita2.bul.com.tr/api/coordinate', this.arrOfObj)
                .then(res => {
                    if (res.status == 200) {

                        //console.log(res.data);
                        lat = res.data.lat;//gidilecek lokasyon için lat değeri
                        lng = res.data.lng;//gidilecek lokasyon için lng değeri
                        zoom = 16;//belirtilen lokasyonu yaklaştırma miktarı
                        //console.log(lat, lng);

                        /* add marker with popup and setzoom event*/
                        var marker = L.marker([lat, lng], {
                            elevation: 260.0,
                            title: "location name"
                        }).addTo(this.map); //harita üzerinde belirtilen lokasyona gidince pointer gibi şekil ekleme
                        marker.bindPopup(this.searched_data_il).openPopup();//belirli loksayona gittikten sonra işaretçi ekleyice o kısımda popup açar
                        this.map.setView([lat, lng], zoom); //harita üzerinde belirtilen lokasyona gitme                                  
                    }
                }).catch(err => {
                    console.log(err);
                })
        }

    }
})