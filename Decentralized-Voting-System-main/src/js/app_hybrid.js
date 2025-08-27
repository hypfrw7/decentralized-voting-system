const Web3 = require('web3');
const contract = require('@truffle/contract');
const votingArtifacts = require('../../build/contracts/Voting.json');

let web3;
let VotingContract;
let votingInstance;

window.App = {
  account: null,
  useMetaMask: false,

  init: function() {
    console.log("Hybrid app initializing...");
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof window.ethereum !== 'undefined') {
      console.log("MetaMask detected - attempting connection");
      
      // Try MetaMask first
      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(accounts => {
          web3 = new Web3(window.ethereum);
          App.account = accounts[0];
          App.useMetaMask = true;
          console.log("MetaMask connected, account:", App.account);
          
          VotingContract = contract(votingArtifacts);
          VotingContract.setProvider(window.ethereum);
          
          return App.initContract();
        })
        .catch(err => {
          console.error("MetaMask connection failed:", err);
          App.fallbackToGanache();
        });
    } else {
      console.log("No MetaMask detected");
      App.fallbackToGanache();
    }
  },

  fallbackToGanache: function() {
    console.log("Using direct Ganache connection");
    web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
    App.useMetaMask = false;
    
    VotingContract = contract(votingArtifacts);
    VotingContract.setProvider(web3.currentProvider);
    
    // Get accounts from Ganache
    web3.eth.getAccounts().then(accounts => {
      App.account = accounts[0];
      console.log("Ganache account:", App.account);
      return App.initContract();
    }).catch(err => {
      console.error("Error getting Ganache accounts:", err);
    });
  },

  initContract: function() {
    console.log("Initializing contract...");
    
    // Use deployed() method - it's working correctly
    VotingContract.deployed().then(instance => {
      votingInstance = instance;
      console.log("Contract deployed() successful");
      console.log("Contract address:", instance.address);
      App.bindEvents();
      App.testContract();
    }).catch(err => {
      console.error("Contract deployment failed:", err);
    });
  },

  testContract: function() {
    console.log("Testing contract connection...");
    
    if (App.useMetaMask) {
      // Use MetaMask for calls
      votingInstance.getCountCandidates().then(count => {
        console.log("✅ Contract test successful! Candidate count:", count.toString());
      }).catch(err => {
        console.error("❌ Contract test failed:", err);
      });
    } else {
      // Use .call() for Ganache
      votingInstance.getCountCandidates.call().then(count => {
        console.log("✅ Contract test successful! Candidate count:", count.toString());
      }).catch(err => {
        console.error("❌ Contract test failed:", err);
      });
    }
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

      // Set voting dates functionality
      $('#addDate').click(function() {
        var startDate = $('#startDate').val();
        var endDate = $('#endDate').val();
        
        if (startDate && endDate) {
          App.setVotingDates(startDate, endDate);
        } else {
          alert("Please select both start and end dates");
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
    console.log("Using MetaMask:", App.useMetaMask);
    
    var txParams = {
      from: App.account,
      gas: 300000
    };

    votingInstance.addCandidate(name, party, txParams).then(result => {
      console.log("✅ Candidate added successfully:", result);
      $('#name').val('');
      $('#party').val('');
      alert("Candidate added successfully!");
    }).catch(err => {
      console.error("❌ Error adding candidate:", err);
      alert("Error: " + err.message);
    });
  },

  loadCandidates: function() {
    console.log("Loading candidates...");
    
    var getCount = App.useMetaMask ? 
      votingInstance.getCountCandidates() : 
      votingInstance.getCountCandidates.call();
    
    getCount.then(count => {
      console.log("Total candidates:", count.toString());
      var candidatesRow = $('#boxCandidate');
      candidatesRow.empty();

      if (count == 0) {
        candidatesRow.append('<tr><td colspan="4">No candidates added yet</td></tr>');
        return;
      }

      // Load each candidate (starting from 1)
      for (let i = 1; i <= count; i++) {
        var getCandidate = App.useMetaMask ? 
          votingInstance.getCandidate(i) : 
          votingInstance.getCandidate.call(i);
          
        getCandidate.then(candidate => {
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
    console.log("Using MetaMask:", App.useMetaMask);
    
    var txParams = {
      from: App.account,
      gas: 300000,
      gasPrice: '20000000000' // 20 gwei - add explicit gas price
    };

    votingInstance.vote(parseInt(selectedCandidate), txParams).then(result => {
      console.log("✅ Vote successful:", result);
      alert("Vote cast successfully!");
      App.loadCandidates();
    }).catch(err => {
      console.error("❌ Voting error:", err);
      
      // Check if it's a date restriction error
      if (err.message.includes('revert') || err.message.includes('internal')) {
        alert("Voting error: Please make sure voting dates are set by admin first!");
      } else {
        alert("Voting error: " + err.message);
      }
    });
  },

  setVotingDates: function(startDate, endDate) {
    console.log("Setting voting dates:", startDate, endDate);
    console.log("Using MetaMask:", App.useMetaMask);
    
    // Convert dates to Unix timestamps
    var startTimestamp = Math.floor(new Date(startDate + 'T00:00:00').getTime() / 1000);
    var endTimestamp = Math.floor(new Date(endDate + 'T23:59:59').getTime() / 1000);
    var currentTimestamp = Math.floor(Date.now() / 1000);
    
    console.log("Current timestamp:", currentTimestamp);
    console.log("Start timestamp:", startTimestamp);
    console.log("End timestamp:", endTimestamp);
    console.log("Date validation - End > Start?", endTimestamp > startTimestamp);
    console.log("Date validation - Start >= Now?", startTimestamp >= currentTimestamp);
    
    // Check validation locally first
    if (endTimestamp <= startTimestamp) {
      alert("End date must be after start date!");
      return;
    }
    
    // Remove past date validation for testing
    // if (startTimestamp < currentTimestamp) {
    //   alert("Start date cannot be in the past!");
    //   return;
    // }
    
    var txParams = {
      from: App.account,
      gas: 500000,
      gasPrice: '20000000000'
    };

    console.log("Calling setDates with params:", startTimestamp, endTimestamp, txParams);

    votingInstance.setDates(startTimestamp, endTimestamp, txParams).then(result => {
      console.log("✅ Voting dates set successfully:", result);
      alert("Voting dates set successfully!");
    }).catch(err => {
      console.error("❌ Error setting dates:", err);
      console.error("Error details:", err.message);
      
      if (err.message.includes('revert')) {
        alert("Contract rejected the dates. Make sure dates haven't been set before and end date is after start date.");
      } else {
        alert("Error setting dates: " + err.message);
      }
    });
  }
};

window.addEventListener('load', function() {
  App.init();
});
