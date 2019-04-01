import { timer } from 'utils/asyncFlow';
import BigNumber from 'utils/bigNumber';
import $ViteJS from 'utils/viteClient';

const loopTime = 2 * 1000;
let balanceTimer = null;

const state = { balanceList: {} };

const mutations = {
    setExchangeBalance(state, balanceList) {
        state.balanceList = balanceList;
    },
    clearDexBalance(state) {
        state.balanceList = {};
    }
};


// .catch(() => {
//     commit('setExchangeBalance', []);
// });
const updateExBalance = (commit, address) =>
    $ViteJS.request('dexfund_getAccountFundInfo', address).then(data => {
        commit('setExchangeBalance', data);
    });
const actions = {
    startLoopExchangeBalance({ commit, dispatch }, address) {
        updateExBalance(commit, address);

        // First stop last
        dispatch('stopLoopExchangeBalance');
        // Second start next
        balanceTimer = new timer(() => updateExBalance(commit, address), loopTime);
        balanceTimer.start();
    },
    stopLoopExchangeBalance() {
        balanceTimer && balanceTimer.stop();
        balanceTimer = null;
    },
    updateExBalance({ commit }, address) {
        updateExBalance(commit, address);
    }
};

const getters = {
    exBalanceList(state) {
        const balance = {};
        Object.keys(state.balanceList).forEach(k => {
            balance[k] = {};
            balance[k].available = BigNumber.toBasic(state.balanceList[k].available, state.balanceList[k].tokenInfo.decimals);
            balance[k].lock = BigNumber.toBasic(state.balanceList[k].locked, state.balanceList[k].tokenInfo.decimals);
            balance[k].tokenInfo = state.balanceList[k].tokenInfo;
        });

        return balance;
    }
};

export default {
    state,
    mutations,
    actions,
    getters
};
