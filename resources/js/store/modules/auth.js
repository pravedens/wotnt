import axios from "axios";

const state = {
    userDetails: {},
    isLoggedIn: false
}

const actions = {
    registerUser({}, user) {
        return new Promise((resolve, reject) => {
            axios
                .post('/api/register', {
                name: user.name,
                email: user.email,
                password: user.password,
                password_confirmation: user.password_confirmation
            })
                .then(response => {
                    if (response.data) {
                        window.location.replace("/login")
                        resolve(response)
                    } else {
                        reject(response)
                    }
                }) .catch((error) => {
                    reject(error);
            })
        })
    }
}

const mutations = {

}

const getters = {
    loggedIn(state) {
        return state.loggedIn
    },
    userDetails(state) {
        return state.userDetails
    }
}

export default {
    namespace: true,
    state,
    actions,
    mutations,
    getters
}

