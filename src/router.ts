import { Router } from '@vaadin/router';

const router = new Router(document.getElementById('outlet'));

router.setRoutes([
	{ path: '/', component: 'aa-home' },
	{ path: '/quadtree', component: 'aa-quadtree' },
	{ path: '/compression', component: 'aa-compression' },
]);
