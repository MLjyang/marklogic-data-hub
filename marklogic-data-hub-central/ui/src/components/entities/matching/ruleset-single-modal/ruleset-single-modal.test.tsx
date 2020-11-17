import React from 'react';
import { render, screen, wait } from '@testing-library/react';
import userEvent from "@testing-library/user-event";

import RulesetSingleModal from './ruleset-single-modal';

import { CurationContext } from '../../../../util/curation-context';
import { updateMatchingArtifact } from '../../../../api/matching';
import { customerMatchingStep } from '../../../../assets/mock-data/curation/curation-context-mock';

jest.mock('../../../../api/matching');

const mockMatchingUpdate = updateMatchingArtifact as jest.Mock;

describe('Matching Ruleset Single Modal component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('can select an property to match and match type and click cancel', () => {
    mockMatchingUpdate.mockResolvedValueOnce({ status: 200, data: {} });
    const toggleModalMock = jest.fn();

    const { queryByText, getByText, rerender } =  render(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetSingleModal
          isVisible={false}
          toggleModal={toggleModalMock}
        />
      </CurationContext.Provider>
    );

    expect(queryByText('Add Match Ruleset for Single Property')).toBeNull();

    rerender(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetSingleModal
          isVisible={true}
          toggleModal={toggleModalMock}
        />
      </CurationContext.Provider>
    );

    expect(queryByText('Add Match Ruleset for Single Property')).toBeInTheDocument();
    userEvent.click(screen.getByText('Select property'));
    userEvent.click(screen.getByText('customerId'));

    userEvent.click(screen.getByText('Select match type'));
    userEvent.click(screen.getByText('Exact'));

    userEvent.click(getByText('Cancel'));
    expect(toggleModalMock).toHaveBeenCalledTimes(1);
    expect(mockMatchingUpdate).toHaveBeenCalledTimes(0);
    expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(0);
  });

  it('can select an property to match and Zip match type and click save', async () => {
    mockMatchingUpdate.mockResolvedValueOnce({ status: 200, data: {} });
    const toggleModalMock = jest.fn();

    const { queryByText, getByText, rerender } =  render(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetSingleModal
          isVisible={false}
          toggleModal={toggleModalMock}
        />
      </CurationContext.Provider>
    );

    expect(queryByText('Add Match Ruleset for Single Property')).toBeNull();

    rerender(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetSingleModal
          isVisible={true}
          toggleModal={toggleModalMock}
        />
      </CurationContext.Provider>
    );

    expect(queryByText('Add Match Ruleset for Single Property')).toBeInTheDocument();
    userEvent.click(screen.getByText('Select property'));
    userEvent.click(screen.getByText('nicknames'));

    userEvent.click(screen.getByText('Select match type'));
    userEvent.click(screen.getByText('Zip'));

    userEvent.click(getByText('Save'));

    await wait(() => {
      expect(mockMatchingUpdate).toHaveBeenCalledTimes(1);
      expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(1);
      expect(toggleModalMock).toHaveBeenCalledTimes(1);
    });

  });

  it('can select Synonym ruleset type and click save', async () => {
    mockMatchingUpdate.mockResolvedValueOnce({ status: 200, data: {} });
    const toggleModalMock = jest.fn();

    const { queryByText, getByText, getByLabelText } =  render(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetSingleModal
          isVisible={true}
          toggleModal={toggleModalMock}
        />
      </CurationContext.Provider>
    );

    expect(queryByText('Add Match Ruleset for Single Property')).toBeInTheDocument();
    userEvent.click(screen.getByText('Select property'));
    userEvent.click(screen.getByText('nicknames'));

    userEvent.click(screen.getByText('Select match type'));
    userEvent.click(screen.getByText('Synonym'));
    userEvent.type(getByLabelText('thesaurus-uri-input'), '/Users/jsmith/Documents/sample-data/4feec983');
    userEvent.type(getByLabelText('filter-input'), '<thsr:qualifier>birds</thsr:qualifier>');


    userEvent.click(getByText('Save'));
    await wait(() => {
      expect(mockMatchingUpdate).toHaveBeenCalledTimes(1);
      expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(1);
      expect(toggleModalMock).toHaveBeenCalledTimes(1);
    });

  });

  it('can select Double Metaphone ruleset type and click save', async () => {
    mockMatchingUpdate.mockResolvedValueOnce({ status: 200, data: {} });
    const toggleModalMock = jest.fn();

    const { queryByText, getByText, getByLabelText } =  render(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetSingleModal
          isVisible={true}
          toggleModal={toggleModalMock}
        />
      </CurationContext.Provider>
    );

    expect(queryByText('Add Match Ruleset for Single Property')).toBeInTheDocument();
    userEvent.click(screen.getByText('Select property'));
    userEvent.click(screen.getByText('orders'));

    userEvent.click(screen.getByText('Select match type'));
    userEvent.click(screen.getByText('Double Metaphone'));
    userEvent.type(getByLabelText('dictionary-uri-input'), '/Users/jsmith/Documents/sample-data/123ABC');
    userEvent.type(getByLabelText('distance-threshold-input'), '100');
    userEvent.type(getByLabelText('collation-input'), 'http://marklogic.com/collation/codepoint');


    userEvent.click(getByText('Save'));
    
    await wait(() => {
      expect(mockMatchingUpdate).toHaveBeenCalledTimes(1);
      expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(1);
      expect(toggleModalMock).toHaveBeenCalledTimes(1);
    });
    
  });

  it('can select Custom ruleset type and click save', async () => {
    mockMatchingUpdate.mockResolvedValueOnce({ status: 200, data: {} });
    const toggleModalMock = jest.fn();

    const { queryByText, getByText, getByLabelText } =  render(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetSingleModal
          isVisible={true}
          toggleModal={toggleModalMock}
        />
      </CurationContext.Provider>
    );

    expect(queryByText('Add Match Ruleset for Single Property')).toBeInTheDocument();
    userEvent.click(screen.getByText('Select property'));
    userEvent.click(screen.getByText('nicknames'));

    userEvent.click(screen.getByText('Select match type'));
    userEvent.click(screen.getByText('Custom'));
    userEvent.type(getByLabelText('uri-input'), '/custom-modules/matching/nameMatch.xqy');
    userEvent.type(getByLabelText('function-input'), 'nameMatch');
    userEvent.type(getByLabelText('namespace-input'), 'http://example.org/custom-modules/matching/nameMatch');


    userEvent.click(getByText('Save'));
    await wait(() => {
      expect(mockMatchingUpdate).toHaveBeenCalledTimes(1);
      expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(1);
      expect(toggleModalMock).toHaveBeenCalledTimes(1);
    });
  });
  
  it('can do input validation', () => {
    mockMatchingUpdate.mockResolvedValueOnce({ status: 200, data: {} });
    const toggleModalMock = jest.fn();

    const { queryByText, getByText, rerender } =  render(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetSingleModal
          isVisible={false}
          toggleModal={toggleModalMock}
        />
      </CurationContext.Provider>
    );

    expect(queryByText('Add Match Ruleset for Single Property')).toBeNull();

    rerender(
      <CurationContext.Provider value={customerMatchingStep}>
        <RulesetSingleModal
          isVisible={true}
          toggleModal={toggleModalMock}
        />
      </CurationContext.Provider>
    );

    expect(queryByText('Add Match Ruleset for Single Property')).toBeInTheDocument();

    userEvent.click(getByText('Save'));

    expect(getByText('A property to match is required')).toBeInTheDocument();
    expect(getByText('A match type is required')).toBeInTheDocument();

    expect(toggleModalMock).toHaveBeenCalledTimes(0);
    expect(mockMatchingUpdate).toHaveBeenCalledTimes(0);
    expect(customerMatchingStep.updateActiveStepArtifact).toHaveBeenCalledTimes(0);
  });
});