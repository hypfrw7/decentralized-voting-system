const Web3 = require('web3');
const contract = require('@truffle/contract');
const votingArtifacts = require('../../build/contracts/Voting.json');

let web3;
let VotingContract;
let votingInstance;

window.App = {
  account: null,

  init: function() {
    console.log("Simple app initializing...");
    return App.initWeb3();
  },

  initWeb3: function() {
    // Use local provider directly
    web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
    console.log("Web3 provider set to local Ganache");
    
    VotingContract = contract(votingArtifacts);
    VotingContract.setProvider(web3.currentProvider);
    
    // Get accounts
    web3.eth.getAccounts().then(accounts => {
      App.account = accounts[0];
      console.log("Using account:", App.account);
      return App.initContract();
    }).catch(err => {
      console.error("Error getting accounts:", err);
    });
  },

  initContract: function() {
    console.log("Initializing contract...");
    
    // Use the specific deployed address
    VotingContract.at("0x7394c1C2BC86100EE4461BC7fF636105E08c1e16").then(instance => {
      votingInstance = instance;
      console.log("Contract connected successfully");
      console.log("Contract address:", instance.address);
      App.bindEvents();
      
      // Test contract by getting candidate count
      App.testContract();
    }).catch(err => {
      console.error("Contract connection failed:", err);
    });
  },

  testContract: function() {
    console.log("Testing contract...");
    
    votingInstance.getCountCandidates.call().then(count => {
      console.log("Candidate count:", count.toString());
    }).catch(err => {
      console.error("Error getting candidate count:", err);
    });
  },

  bindEvents: function() {
    $(document).ready(function() {
      // Admin functionality
      $('#addCandidate').click(function() {
        var name = $('#name').val();
        var party = $('#party').val();
        
        if (name && party) {
          App.addCandidate(name, party);
        } else {
          alert("Please enter both name and party");
        }
      });

      // User functionality - load candidates on user page
      if ($('#boxCandidate').length > 0) {
        App.loadCandidates();
      }

      // Vote button functionality
      $('#voteButton').click(function() {
        App.vote();
      });
    });
  },

  addCandidate: function(name, party) {
    console.log("Adding candidate:", name, party);
    
    votingInstance.addCandidate(name, party, {
      from: App.account,
      gas: 300000
    }).then(result => {
      console.log("Candidate added:", result);
      $('#name').val('');
      $('#party').val('');
      alert("Candidate added successfully!");
    }).catch(err => {
      console.error("Error adding candidate:", err);
      alert("Error: " + err.message);
    });
  },

  loadCandidates: function() {
    console.log("Loading candidates...");
    
    votingInstance.getCountCandidates.call().then(count => {
      console.log("Total candidates:", count.toString());
      var candidatesRow = $('#boxCandidate');
      candidatesRow.empty();

      if (count == 0) {
        candidatesRow.append('<tr><td colspan="4">No candidates added yet</td></tr>');
        return;
      }

      // Load each candidate (starting from 1)
      for (let i = 1; i <= count; i++) {
        votingInstance.getCandidate.call(i).then(candidate => {
          console.log("Candidate", i, ":", candidate);
          var row = `
            <tr>
              <td>${candidate[1]}</td>
              <td>${candidate[2]}</td>
              <td>${candidate[3].toString()}</td>
              <td><input type="radio" name="candidate" value="${i}"></td>
            </tr>
          `;
          candidatesRow.append(row);
          $('#voteButton').prop('disabled', false);
        }).catch(err => {
          console.error("Error loading candidate", i, ":", err);
        });
      }
    }).catch(err => {
      console.error("Error getting candidate count:", err);
      $('#boxCandidate').append('<tr><td colspan="4">Error: ' + err.message + '</td></tr>');
    });
  },

  vote: function() {
    var selectedCandidate = $('input[name="candidate"]:checked').val();
    
    if (!selectedCandidate) {
      alert("Please select a candidate");
      return;
    }

    console.log("Voting for candidate:", selectedCandidate);
    
    votingInstance.vote(parseInt(selectedCandidate), {
      from: App.account,
      gas: 300000
    }).then(result => {
      console.log("Vote successful:", result);
      alert("Vote cast successfully!");
      App.loadCandidates();
    }).catch(err => {
      console.error("Voting error:", err);
      alert("Voting error: " + err.message);
    });
  }
};

window.addEventListener('load', function() {
  App.init();
});
