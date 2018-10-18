/*
    This file is part of web3.js.

    web3.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    web3.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * @file LogSubscriptionModel.js
 * @authors: Samuel Furter <samuel@ethereum.org>
 * @date 2018
 */

import AbstractSubscriptionModel from '../../../../lib/models/AbstractSubscriptionModel';

export default class LogSubscriptionModel extends AbstractSubscriptionModel {

    /**
     * @param {Object} options
     * @param {Object} utils
     * @param {Object} formatters
     * @param {GetPastLogsMethodModel} getPastLogsMethodModel
     * @param {MethodController} methodController
     *
     * @constructor
     */
    constructor(options, utils, formatters, getPastLogsMethodModel, methodController) {
        super('eth_subscribe', 'logs', options, utils, formatters);
        this.getPastLogsMethodModel = getPastLogsMethodModel;
        this.methodController = methodController;
    }

    /**
     * This method will be executed before the subscription starts.
     *
     * @method beforeSubscription
     *
     * @param {Subscription} subscription
     * @param {AbstractWeb3Module} moduleInstance
     * @param {Function} callback
     */
    beforeSubscription(subscription, moduleInstance, callback) {
        const self = this;
        this.options = this.formatters.inputLogFormatter(this.options);
        this.getPastLogsMethodModel.parameters = [options];

        this.methodController.execute(
            this.getPastLogsMethodModel,
            moduleInstance.currentProvider,
            null,
            moduleInstance
        ).then(logs => {
            logs.forEach(log => {
                callback(false, log);
                subscription.emit('data', log);
            });

            delete self.options.fromBlock;
        }).catch(error => {
            subscription.emit('error', error);
            callback(error, null);
        });
    }

    /**
     * This method will be executed on each new subscription item.
     *
     * @method onNewSubscriptionItem
     *
     * @param {Subscription} subscription
     * @param {*} subscriptionItem
     *
     * @returns {Object}
     */
    onNewSubscriptionItem(subscription, subscriptionItem) {
        return this.formatters.outputLogFormatter(subscriptionItem);
    }
}
