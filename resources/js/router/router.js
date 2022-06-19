import  { createRouter, createWebHistory} from 'vue-router';
import Container from "../views/layout/Container";
import Register from "../views/Auth/Register";
import Login from "../views/Auth/Login";
import Dashboard from "../views/pages/Dashboard";
import UserProfile from "../views/pages/UserProfile";
import Middleware from "../middleware";
import store from "../store";
import middlewarePipeline from "./middlewarePipeline";

const routes = [
    {
    path: "/",
    name: Container,
    component: Container
    },
    {
        path: "/login",
        name: Login,
        component: Login,
    },
    {
        path: "/register",
        name: Register,
        component: Register,
    },
    {
        path: "/dashboard",
        name: Dashboard,
        component: Dashboard,
        meta: {
            middleware: [Middleware.auth]
        },
        children: [
            {
                path: "/dashboard/userprofile",
                name: "dashboard.userprofile",
                component: UserProfile,
                //meta: {
                    //middleware: [Middleware.auth, Middleware.isSubscribed]
                //}
            }
        ]
    },
    {
        path: "/userprofile",
        name: UserProfile,
        component: UserProfile
    },
]

const router = createRouter({
    routes,
    history: createWebHistory(process.env.BASE_URL)
})

router.beforeEach((to, from, next) => {
    if(!to.meta.middleware) {
        return next()
    }

    const middleware = to.meta.middleware

    const context = {
        to,
        from,
        next,
        store
    }
    return  middleware[0] ({
        ...context,
        next: middlewarePipeline(context, middleware, 1)
    })
})

export default router
