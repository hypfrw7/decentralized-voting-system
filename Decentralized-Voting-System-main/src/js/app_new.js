const Web3 = require('web3');
const contract = require('@truffle/contract');
const votingArtifacts = require('../../build/contracts/Voting.json');
var VotingContract = contract(votingArtifacts);

window.App = {
  account: null,
  contracts: {},

  init: function() {
    console.log("App initializing...");
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof window.ethereum !== 'undefined') {
      console.log("MetaMask detected");
      return window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(accounts => {
          App.account = accounts[0];
          console.log("Connected account:", App.account);
          VotingContract.setProvider(window.ethereum);
          return App.initContract();
        })
        .catch(err => {
          console.error("MetaMask error:", err);
          // Fallback to local provider if MetaMask fails
          console.log("Falling back to local provider");
          var provider = new Web3.providers.HttpProvider("http://127.0.0.1:7545");
          VotingContract.setProvider(provider);
          return App.initContract();
        });
    } else {
      console.log("Using fallback provider");
      var provider = new Web3.providers.HttpProvider("http://127.0.0.1:7545");
      VotingContract.setProvider(provider);
      return App.initContract();
    }
  },

  initContract: function() {
    console.log("Initializing contract...");
    
    // Add a small delay to ensure provider is fully set
    setTimeout(() => {
      VotingContract.deployed().then(function(instance) {
        console.log("Contract instance:", instance);
        console.log("Contract address:", instance.address);
        App.bindEvents();
      }).catch(function(err) {
        console.error("Contract deployment error:", err);
        // Try to manually set the contract address if deployed() fails
        console.log("Attempting manual contract connection...");
        VotingContract.at("0x7394c1C2BC86100EE4461BC7fF636105E08c1e16").then(function(instance) {
          console.log("Manual contract connection successful:", instance);
          App.bindEvents();
        }).catch(function(err2) {
          console.error("Manual contract connection failed:", err2);
        });
      });
    }, 500);
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
    
    VotingContract.deployed().then(function(instance) {
      // Use a default account from Ganache if MetaMask has 0 ETH
      var fromAccount = App.account;
      if (!fromAccount) {
        fromAccount = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57"; // Default Ganache account
      }
      
      return instance.addCandidate(name, party, {
        from: fromAccount,
        gas: 300000
      });
    }).then(function(result) {
      console.log("Candidate added successfully:", result);
      $('#name').val('');
      $('#party').val('');
      alert("Candidate added successfully!");
    }).catch(function(err) {
      console.error("Error adding candidate:", err);
      alert("Error adding candidate: " + err.message);
    });
  },

  loadCandidates: function() {
    console.log("Loading candidates...");
    console.log("Current account:", App.account);
    
    VotingContract.deployed().then(function(instance) {
      console.log("Contract instance loaded for candidates");
      console.log("Contract address:", instance.address);
      return instance.getCountCandidates();
    }).then(function(count) {
      console.log("Number of candidates:", count.toString());
      var candidatesRow = $('#boxCandidate');
      candidatesRow.empty();

      if (count == 0) {
        candidatesRow.append('<tr><td colspan="4">No candidates added yet</td></tr>');
        return;
      }

      var promises = [];
      // Note: Candidates start from index 1, not 0 in the smart contract
      for (let i = 1; i <= count; i++) {
        promises.push(
          VotingContract.deployed().then(function(instance) {
            return instance.getCandidate(i); // Use getCandidate function instead of direct mapping access
          }).then(function(candidate) {
            console.log("Candidate", i, ":", candidate);
            var candidateTemplate = `
              <tr>
                <td>${candidate[1]}</td>
                <td>${candidate[2]}</td>
                <td>${candidate[3].toString()}</td>
                <td><input type="radio" name="candidate" value="${i}"></td>
              </tr>
            `;
            candidatesRow.append(candidateTemplate);
          })
        );
      }
      
      Promise.all(promises).then(() => {
        // Enable vote button when all candidates are loaded
        $('#voteButton').prop('disabled', false);
        console.log("All candidates loaded successfully");
      });
      
    }).catch(function(err) {
      console.error("Error getting candidate count:", err);
      $('#boxCandidate').append('<tr><td colspan="4">Error loading candidates: ' + err.message + '</td></tr>');
    });
  },

  vote: function() {
    var selectedCandidate = $('input[name="candidate"]:checked').val();
    
    if (selectedCandidate === undefined) {
      alert("Please select a candidate to vote for");
      return;
    }

    console.log("Voting for candidate:", selectedCandidate);
    
    VotingContract.deployed().then(function(instance) {
      return instance.vote(parseInt(selectedCandidate), {
        from: App.account,
        gas: 300000
      });
    }).then(function(result) {
      console.log("Vote cast successfully:", result);
      alert("Vote cast successfully!");
      App.loadCandidates(); // Reload to show updated vote counts
    }).catch(function(err) {
      console.error("Error voting:", err);
      alert("Error voting: " + err.message);
    });
  },

  setVotingDates: function(startDate, endDate) {
    console.log("Setting voting dates:", startDate, endDate);
    
    // Convert dates to Unix timestamps
    var startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
    var endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
    
    VotingContract.deployed().then(function(instance) {
      return instance.setDates(startTimestamp, endTimestamp, {
        from: App.account,
        gas: 300000
      });
    }).then(function(result) {
      console.log("Voting dates set successfully:", result);
      alert("Voting dates set successfully!");
    }).catch(function(err) {
      console.error("Error setting dates:", err);
      alert("Error setting dates: " + err.message);
    });
  }
};

window.addEventListener('load', function() {
  App.init();
});
