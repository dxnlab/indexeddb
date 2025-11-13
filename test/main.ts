import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import Tester from './Tester.vue';


const vuetify = createVuetify({
    components,
    directives,
});
const app = createApp(Tester);
app.use(vuetify)
    .mount('#tests');
