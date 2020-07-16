import { createElement } from 'lwc';
import ListInfiniteScrolling from 'c/listInfiniteScrolling';
import { registerApexTestWireAdapter } from '@salesforce/sfdx-lwc-jest';
import getAccountsPaginated from '@salesforce/apex/PaginatedListControllerLwc.getAccountsPaginated';

const getAccountsPaginatedAdapter = registerApexTestWireAdapter(
    getAccountsPaginated
);
const mockAccountData = require('./data/mockAccountData.json');

describe('c-list-infinite-scrolling', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('displays a data table when records is true', () => {
        // Create element
        const element = createElement('c-list-infinite-scrolling', {
            is: ListInfiniteScrolling
        });
        document.body.appendChild(element);

        // Verify that the data table exsists
        // and has our mock data
        getAccountsPaginatedAdapter.emit(mockAccountData);

        return Promise.resolve().then(() => {
            const dataTableEl = element.shadowRoot.querySelector(
                'lightning-datatable'
            );
            expect(dataTableEl.data).toEqual(mockAccountData.records);
        });
    });
    it('displays an error when the error variable is set', () => {
        const MESSAGE = 'Error retrieving data';

        // Create element
        const element = createElement('c-list-infinite-scrolling', {
            is: ListInfiniteScrolling
        });
        document.body.appendChild(element);

        // Emit data from wire adapter
        getAccountsPaginatedAdapter.error(MESSAGE);

        return Promise.resolve().then(() => {
            const errorPanelEl = element.shadowRoot.querySelector(
                'c-error-panel'
            );
            expect(errorPanelEl.errors.body).toBe(MESSAGE);
        });
    });
    it('requests more data when scrolling reaches the bottom', () => {
        const element = createElement('c-list-infinite-scrolling', {
            is: ListInfiniteScrolling
        });
        document.body.appendChild(element);

        getAccountsPaginatedAdapter.emit(mockAccountData);

        return Promise.resolve()
            .then(() => {
                const dataTableEl = element.shadowRoot.querySelector(
                    'lightning-datatable'
                );

                expect(dataTableEl).not.toBeNull();
                expect(dataTableEl.data).toEqual(mockAccountData.records);
                expect(
                    getAccountsPaginatedAdapter.getLastConfig().pageToken
                ).toBe(0);
            })
            .then(() => {
                // Toggle checkbox to show details
                const dataTableEl = element.shadowRoot.querySelector(
                    'lightning-datatable'
                );
                dataTableEl.dispatchEvent(new CustomEvent('loadmore'));
            })
            .then(() => {
                expect(
                    getAccountsPaginatedAdapter.getLastConfig().pageToken
                ).toBe(5);
            });
    });
});
