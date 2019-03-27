import React from 'react'
import { Mutation } from 'react-apollo'
import styled from '@emotion/styled'

import { useEditable } from '../hooks'
import mq from 'mediaQuery'
import { TRANSFER_REGISTRARS } from '../../graphql/mutations'

import { DetailsItem } from './DetailsItem'
import Button from '../Forms/Button'
import PendingTx from '../PendingTx'
import { formatDate } from '../../utils/dates'
import { ReactComponent as DefaultMigrationIcon } from 'components/Icons/Migration.svg'

const MigrationInstruction = styled('h3')`
  margin: 0;
  margin-bottom: 0px;
  font-family: Overpass;
  font-size: 18px;
  font-weight: 300;
  color: #2b2b2b;
  ${mq.small`
      font-size: 20px;
  `}
`

const MigrationExplanation = styled('p')`
  font-weight: 700;
  font-size: 14px;
  color: #adbbcd;
  letter-spacing: 0;
  margin-bottom: 20px;

  ${mq.small`
    margin: 0;
  `}
`

const TransferButton = styled(Button)`
  width: 130px;
`

const MigrationIcon = styled(DefaultMigrationIcon)`
  position: absolute;
  left: 20px;
  top: 25px;

  ${mq.small`
    left: 30px;
  `}
`

const TransferDetail = styled(DetailsItem)`
  padding: 20px;
  background-color: #f0f6fa;
  position: relative;
  padding-top: 65px;

  ${mq.small`
    padding-top: 20px;
    padding-right: 150px;
    padding-left: 75px;
  `}
`

const Action = styled('div')`
  margin-bottom: 1em;
  ${mq.small`
    margin-top: 0;
    position: absolute;
    top: 68%;
    right:30px;
    transform: translate(0, -65%);
  `}
`

function TransferRegistrars({
  label,
  currentBlockDate,
  transferEndDate,
  migrationStartDate,
  refetch
}) {
  const { state, actions } = useEditable()
  const { txHash, pending, confirmed } = state
  const { startPending, setConfirmed } = actions

  const TooEarly = (
    <TransferDetail>
      <MigrationIcon />
      <MigrationInstruction>
        You cannot migrate into permanent registrar yet
      </MigrationInstruction>
      <MigrationExplanation>
        Migrate between {formatDate(migrationStartDate, true)} -{' '}
        {formatDate(transferEndDate, true)}. You will otherwise lose your name
      </MigrationExplanation>
    </TransferDetail>
  )

  const MigrateNow = (
    <TransferDetail>
      <MigrationIcon />
      <MigrationInstruction>
        Migrate your name to the Permanent Registrar
      </MigrationInstruction>
      <MigrationExplanation>
        Migrate by {formatDate(transferEndDate, true)}. You will otherwise lose
        your name
      </MigrationExplanation>
    </TransferDetail>
  )

  const TooLate = (
    <TransferDetail>
      <MigrationIcon />
      <MigrationInstruction>
        Migration period was ended at {formatDate(transferEndDate, true)}
      </MigrationInstruction>
      <MigrationExplanation>
        You no longer has ownership on this name but you can still get your
        locked ETH back.
      </MigrationExplanation>
    </TransferDetail>
  )

  const MigrateAction = (
    <>
      {pending && !confirmed && txHash ? (
        <PendingTx
          txHash={txHash}
          onConfirmed={() => {
            setConfirmed()
            refetch()
          }}
        />
      ) : (
        <Mutation
          mutation={TRANSFER_REGISTRARS}
          variables={{ label }}
          onCompleted={data => {
            startPending(Object.values(data)[0])
          }}
        >
          {mutate => <TransferButton onClick={mutate}>Migrate</TransferButton>}
        </Mutation>
      )}
    </>
  )

  let CurrentMigrationInstraction, CurrentAction

  if (currentBlockDate < migrationStartDate) {
    CurrentMigrationInstraction = TooEarly
    CurrentAction = <TransferButton type="disabled">Migrate</TransferButton>
  } else if (currentBlockDate < transferEndDate) {
    CurrentMigrationInstraction = MigrateNow
    CurrentAction = MigrateAction
  } else {
    CurrentMigrationInstraction = TooLate
    // This is TBD
    CurrentAction = <TransferButton>Release</TransferButton>
  }

  return (
    <>
      {CurrentMigrationInstraction}
      <Action>{CurrentAction}</Action>
    </>
  )
}

export default TransferRegistrars
