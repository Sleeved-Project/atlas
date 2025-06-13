import { test } from '@japa/runner'
import IrisMapper from '#mappers/iris_mapper'
import { ScanAnalyseIrisResponse, ScanCardInfoDTO } from '#types/iris_type'

test.group('IrisMapper', () => {
  test('scanAnalyseIrisResponseToScanCardInfoDTO - should correctly map data with multiple matches', ({
    assert,
  }) => {
    const mockScanResponse: ScanAnalyseIrisResponse = {
      message: 'Success',
      cards: [
        {
          card_hash: 'hash123',
          card_index: 0,
          is_similar: true,
          similarity_percentage: 95,
          matched_card_id: '123',
          matched_card_name: 'Test Card',
          top_n_matches: [
            {
              card_id: '123',
              card_name: 'Test Card 1',
              similarity_percentage: 95,
              hamming_distance: 5,
            },
            {
              card_id: '456',
              card_name: 'Test Card 2',
              similarity_percentage: 85,
              hamming_distance: 10,
            },
            {
              card_id: '789',
              card_name: 'Test Card 3',
              similarity_percentage: 75,
              hamming_distance: 15,
            },
          ],
        },
      ],
    }

    const expectedResult: ScanCardInfoDTO[] = [
      { id: '123', similarity: 95 },
      { id: '456', similarity: 85 },
      { id: '789', similarity: 75 },
    ]

    const result = IrisMapper.scanAnalyseIrisResponseToScanCardInfoDTO(mockScanResponse)

    assert.deepEqual(result, expectedResult)
  })

  test('scanAnalyseIrisResponseToScanCardInfoDTO - should correctly map data with a single match', ({
    assert,
  }) => {
    const mockScanResponse: ScanAnalyseIrisResponse = {
      message: 'Success',
      cards: [
        {
          card_hash: 'hash123',
          card_index: 0,
          is_similar: true,
          similarity_percentage: 100,
          matched_card_id: '123',
          matched_card_name: 'Test Card',
          top_n_matches: [
            {
              card_id: '123',
              card_name: 'Test Card',
              similarity_percentage: 100,
              hamming_distance: 0,
            },
          ],
        },
      ],
    }

    const expectedResult: ScanCardInfoDTO[] = [{ id: '123', similarity: 100 }]

    const result = IrisMapper.scanAnalyseIrisResponseToScanCardInfoDTO(mockScanResponse)

    assert.deepEqual(result, expectedResult)
  })

  test('scanAnalyseIrisResponseToScanCardInfoDTO - should return an empty array if no match', ({
    assert,
  }) => {
    const mockScanResponse: ScanAnalyseIrisResponse = {
      message: 'Success',
      cards: [
        {
          card_hash: 'hash123',
          card_index: 0,
          is_similar: false,
          similarity_percentage: 0,
          matched_card_id: '',
          matched_card_name: '',
          top_n_matches: [],
        },
      ],
    }

    const result = IrisMapper.scanAnalyseIrisResponseToScanCardInfoDTO(mockScanResponse)

    assert.deepEqual(result, [])
  })

  test('scanAnalyseIrisResponseToScanCardInfoDTO - should correctly handle multiple input cards', ({
    assert,
  }) => {
    const mockScanResponse: ScanAnalyseIrisResponse = {
      message: 'Success',
      cards: [
        {
          card_hash: 'hash123',
          card_index: 0,
          is_similar: true,
          similarity_percentage: 95,
          matched_card_id: '123',
          matched_card_name: 'First Card',
          top_n_matches: [
            {
              card_id: '123',
              card_name: 'First Card',
              similarity_percentage: 95,
              hamming_distance: 5,
            },
          ],
        },
        {
          card_hash: 'hash456',
          card_index: 1,
          is_similar: true,
          similarity_percentage: 92,
          matched_card_id: '456',
          matched_card_name: 'Second Card',
          top_n_matches: [
            {
              card_id: '456',
              card_name: 'Second Card',
              similarity_percentage: 92,
              hamming_distance: 8,
            },
          ],
        },
      ],
    }

    const expectedResult: ScanCardInfoDTO[] = [{ id: '123', similarity: 95 }]

    const result = IrisMapper.scanAnalyseIrisResponseToScanCardInfoDTO(mockScanResponse)

    assert.deepEqual(result, expectedResult)
  })

  test('scanAnalyseIrisResponseToScanCardInfoDTO - should throw an exception if cards is empty', ({
    assert,
  }) => {
    const mockScanResponse: ScanAnalyseIrisResponse = {
      message: 'Success',
      cards: [],
    }

    assert.throws(() => {
      IrisMapper.scanAnalyseIrisResponseToScanCardInfoDTO(mockScanResponse)
    }, /Cannot read properties of undefined/)
  })
})
