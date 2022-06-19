import axios from "axios";

const state = {
    userDetails: {},
    isLoggedIn: false
}

const actions = {

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

